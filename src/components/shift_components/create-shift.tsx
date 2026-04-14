"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { SaveIcon } from "lucide-react"
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

  // ✅ sync form → draftShift
  useEffect(() => {
    setDraftShift({
      ...form,
      id: crypto.randomUUID(),
    })
  }, [form])

  // 🔐 Load user
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUserId(data.user.id)
    }
    loadUser()
  }, [])

  // 📦 Load subjects + jobs
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

  // 💾 SAVE
  const saveSchedule = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("schedules").upsert({
      user_id: user.id,
      schedule_json: weekShift,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })

    if (error) console.error(error.message)
    else alert("Saved ✅")
  }

  // ➕ Add shift (manual button)
  const addShift = () => {
    if (!form.title) return

    const newShift = {
      ...form,
      id: crypto.randomUUID(),
    }

    setWeekShift(prev => {
      const current = prev[selectedDay]

      // ❌ prevent duplicate same time + title
      const exists = current.some(
        s => s.start === newShift.start && s.title === newShift.title
      )
      if (exists) {
        alert("Duplicate shift ❌")
        return prev
      }

      return {
        ...prev,
        [selectedDay]: [...current, newShift]
          .sort((a,b)=>a.start.localeCompare(b.start))
      }
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

      {/* 🎯 Type */}
      <select
        value={form.type}
        onChange={(e)=>setForm({...form, type:e.target.value as any, title:""})}
        className="w-full p-2 rounded bg-white/10"
      >
        <option value="subject">Subject</option>
        <option value="job">Job</option>
        <option value="event">Event</option>
        <option value="break">Break</option>
      </select>

      {/* 🎓 Subject */}
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

      {/* 💼 Job */}
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

      {/* 🟡 BREAK FIX */}
      {form.type === "break" && (
        <Input
          placeholder="Break name (Lunch, Rest...)"
          value={form.title}
          onChange={(e)=>setForm({...form, title:e.target.value, color:"#f59e0b"})}
        />
      )}

      {/* ⏰ Time */}
      <div className="flex gap-2">
        <Input type="time" value={form.start}
          onChange={(e)=>setForm({...form, start:e.target.value})}/>
        <Input type="time" value={form.end}
          onChange={(e)=>setForm({...form, end:e.target.value})}/>
      </div>

      <Button onClick={addShift} className="w-full">
        Add Shift
      </Button>

      {/* 📋 Timeline */}
      <TimelineDay
        draftShift={draftShift}
        shifts={weekShift[selectedDay]}

        onAdd={(shift) => {
          setWeekShift(prev => {
            const current = prev[selectedDay]

            const exists = current.some(
              s => s.start === shift.start && s.title === shift.title
            )
            if (exists) return prev

            return {
              ...prev,
              [selectedDay]: [...current, shift]
                .sort((a,b)=>a.start.localeCompare(b.start))
            }
          })
        }}

        // 🗑 DELETE
        onDelete={(id) => {
          setWeekShift(prev => ({
            ...prev,
            [selectedDay]: prev[selectedDay].filter(s => s.id !== id)
          }))
        }}

        // ✏️ UPDATE
        onUpdate={(updated) => {
          setWeekShift(prev => ({
            ...prev,
            [selectedDay]: prev[selectedDay].map(s =>
              s.id === updated.id ? updated : s
            )
          }))
        }}
      />

      {/* 💾 SAVE */}
      <Button onClick={saveSchedule} className="w-full">
        <SaveIcon /> Save Shift
      </Button>

    </div>
  )
}