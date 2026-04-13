'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {SaveIcon} from "lucide-react"
import type { UniversalShift, WeeklyTemplate } from "@/types/shift-type"
import TimelineDay from "@/components/shift_components/timelineday"

const days: (keyof WeeklyTemplate)[] = [
  "sunday","monday","tuesday","wednesday","thursday","friday","saturday"
]

export default function CreateShift() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [draftShift, setDraftShift] = useState<UniversalShift | null>(null)

  const [selectedDay, setSelectedDay] = useState<keyof WeeklyTemplate>("monday")

  const [weekShift, setWeekShift] = useState<WeeklyTemplate>({
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  })

  const [form, setForm] = useState<UniversalShift>({
    id: "",
    type: "subject",
    title: "",
    start: "09:00",
    end: "10:00",
    color: "#3b82f6",
  })

  // ✅ Load user
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUserId(data.user.id)
    }
    loadUser()
  }, [])

  // ✅ Load subjects + jobs
  useEffect(() => {
    if (!userId) return

    const loadData = async () => {
      const { data: s } = await supabase.from("subjects").select("*").eq("user_id", userId)
      const { data: j } = await supabase.from("jobs").select("*").eq("user_id", userId)

      if (s) setSubjects(s)
      if (j) setJobs(j)
    }

    loadData()
  }, [userId])

const  saveSchedule= async(schedule: WeeklyTemplate) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("schedules")
    .upsert(
      {
        user_id: user.id,
        schedule_json: schedule,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) console.error(error.message);
}

const loadSchedule = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("schedules")
    .select("schedule_json")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error(error.message);
    return null;
  }

  return data?.schedule_json;
}

  // ✅ Add shift to selected day
  const addShift = () => {
    if (!form.title) return

    const newShift = {
      ...form,
      id: crypto.randomUUID(),
    }

    setWeekShift(prev => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newShift]
        .sort((a,b)=>a.start.localeCompare(b.start)) // auto sort
    }))

    // reset form
    setForm({
      id: "",
      type: "subject",
      title: "",
      start: "09:00",
      end: "10:00",
      color: "#3b82f6",
    })
  }

  return (
    <div className="p-4 text-white space-y-4 max-w-md mx-auto">

      {/* 🗓 Day Selector */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`text-xs p-2 rounded ${
              selectedDay === d ? "bg-emerald-500 text-black" : "bg-white/10"
            }`}
          >
            {d.slice(0,3)}
          </button>
        ))}
      </div>

      {/* 🎯 Type Selector */}
      <select
        value={form.type}
        onChange={(e)=>setForm({...form, type:e.target.value as any})}
        className="w-full p-2 rounded bg-white/10"
      >
        <option value="subject">Subject</option>
        <option value="job">Job</option>
        <option value="event">Event</option>
        <option value="break">Break</option>
      </select>

      {/* 🎓 Subject / Job Selector */}
      {form.type === "subject" && (
        <select
          onChange={(e)=>{
            const s = subjects.find(x=>x.id==e.target.value)
            setForm({...form, title:s?.name, color:s?.color})
          }}
          className="w-full p-2 rounded bg-white/10"
        >
          <option>Select Subject</option>
          {subjects.map(s=>(
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      {form.type === "job" && (
        <select
          onChange={(e)=>{
            const j = jobs.find(x=>x.id==e.target.value)
            setForm({...form, title:j?.job_name, color:"#22c55e"})
          }}
          className="w-full p-2 rounded bg-white/10"
        >
          <option>Select Job</option>
          {jobs.map(j=>(
            <option key={j.id} value={j.id}>{j.job_name}</option>
          ))}
        </select>
      )}

      {/* ⏰ Time */}
      <div className="flex gap-2">
        <Input type="time" value={form.start}
          onChange={(e)=>setForm({...form, start:e.target.value})}/>
        <Input type="time" value={form.end}
          onChange={(e)=>setForm({...form, end:e.target.value})}/>
      </div>

      {/* ➕ Add */}
      <Button onClick={addShift} className="w-full">
        Add Shift
      </Button>

      {/* 📋 Preview */}
      <div className="space-y-2">
        <TimelineDay
        draftShift={draftShift}
  shifts={weekShift[selectedDay]}
  onAdd={(shift) => {
    setWeekShift(prev => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], shift]
    }))
  }}
/>
      </div>
      <div>
        {weekShift && (
            <Button variant={"default"} className="border-2 rounded-xl border-white hover: bg-white hover text-black hover border-black">
                {<SaveIcon />}
                Save Shift
                </Button>
        )}
      </div>

    </div>
  )
}