"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Subject } from "@/types/subject";
import CreateWorkShift from "./job_shift_create";

type DayType = "school" | "holiday";

type SelectMode = "school" | "job" | "event";

type ScheduleBlock = {
  id: string;
  subjectId: number;
  start: string;
  end: string;
};

type DaySchedule = {
  dayType: DayType;
  blocks: ScheduleBlock[];
  note?: string;
};

type ScheduleState = Record<number, DaySchedule>;

const week = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function emptyDay(): DaySchedule {
  return { dayType: "school", blocks: [] };
}

function emptySchedule(): ScheduleState {
  return {
    0: emptyDay(),
    1: emptyDay(),
    2: emptyDay(),
    3: emptyDay(),
    4: emptyDay(),
    5: emptyDay(),
    6: emptyDay(),
  };
}

export default function SchoolScheduler() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<ScheduleState>(emptySchedule());
  const [selectedDay, setSelectedDay] = useState(1);
  const [saving, setSaving] = useState(false);
  const [selectMode, setSelectMode] = useState<SelectMode>("school");

  useEffect(() => {
    loadSubjects();
    loadSchedule();
  }, []);

  async function getUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? "";
  }

  async function loadSubjects() {
    const user_id = await getUserId();
    const { data } = await supabase.from("subjects").select("*").order("id").eq("user_id", user_id);
    const breakSubject: Subject = {
      id: -1,
      user_id: "",
      name: "Break",
      teacher: "",
      room: "",
      color: "#F59E0B",
      duration_minutes: 10,
    };
    if (data) setSubjects([...data, breakSubject]);
    else setSubjects([breakSubject]);
  }

  async function loadSchedule() {
    const user_id = await getUserId();
    if (!user_id) return;

    const { data, error } = await supabase
      .from("school_templates")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) console.error("Failed to load schedule:", error.message);

    if (data?.schedule_json) {
      setSchedule({
        0: data.schedule_json.sunday || emptyDay(),
        1: data.schedule_json.monday || emptyDay(),
        2: data.schedule_json.tuesday || emptyDay(),
        3: data.schedule_json.wednesday || emptyDay(),
        4: data.schedule_json.thursday || emptyDay(),
        5: data.schedule_json.friday || emptyDay(),
        6: data.schedule_json.saturday || emptyDay(),
      });
    }
  }

  async function saveSchedule() {
    setSaving(true);
    const user_id = await getUserId();
    if (!user_id) return setSaving(false);

    await supabase.from("school_templates").upsert({
      user_id,
      semester: "default",
      name: "Main Schedule",
      schedule_json: {
        sunday: schedule[0],
        monday: schedule[1],
        tuesday: schedule[2],
        wednesday: schedule[3],
        thursday: schedule[4],
        friday: schedule[5],
        saturday: schedule[6],
      },
    });
    setSaving(false);
  }

  function updateDay(day: number, patch: Partial<DaySchedule>) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...patch },
    }));
  }

  function addBlock() {
    const current = schedule[selectedDay];
    if (!subjects.length) return;
    const newBlock: ScheduleBlock = {
      id: crypto.randomUUID(),
      subjectId: subjects[0].id ?? 0,
      start: "09:00",
      end: "09:50",
    };
    updateDay(selectedDay, { blocks: [...current.blocks, newBlock] });
  }

  function updateBlock(id: string, patch: Partial<ScheduleBlock>) {
    const current = schedule[selectedDay];
    updateDay(selectedDay, {
      blocks: current.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  }

  function removeBlock(id: string) {
    const current = schedule[selectedDay];
    updateDay(selectedDay, { blocks: current.blocks.filter((b) => b.id !== id) });
  }

  const current = schedule[selectedDay];

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 max-w-md mx-auto space-y-4">

      {/* Top Mode Selector */}
      <div className="flex justify-between gap-2 mb-4">
        <button
          className={`flex-1 py-2 rounded ${selectMode==="school" ? "bg-blue-600" : "bg-blue-400"} hover:bg-blue-700`}
          onClick={() => setSelectMode("school")}
        >
          School
        </button>
        <button
          className={`flex-1 py-2 rounded ${selectMode==="job" ? "bg-green-600" : "bg-green-400"} hover:bg-green-700`}
          onClick={() => setSelectMode("job")}
        >
          Part Time
        </button>
        <button
          className={`flex-1 py-2 rounded ${selectMode==="event" ? "bg-purple-600" : "bg-purple-400"} hover:bg-purple-700`}
          onClick={() => setSelectMode("event")}
        >
          Event
        </button>
      </div>

      {/* SCHOOL MODE */}
      {selectMode === "school" && (
        <div>
          {/* Day Selector */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {week.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`py-1 rounded text-xs font-semibold ${selectedDay === i ? "bg-emerald-500 text-black" : "bg-white/10 text-white"}`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Day Type Selector */}
          <select
            value={current.dayType}
            onChange={(e) => updateDay(selectedDay, { dayType: e.target.value as DayType })}
            className="w-full p-2 rounded bg-white/10 border border-white/20 text-white mb-2"
          >
            <option value="school">School Day</option>
            <option value="holiday">Holiday</option>
          </select>

          {/* Blocks Editor */}
          {current.dayType === "school" ? (
            <div className="space-y-2">
              {current.blocks.map((block) => {
                const subject = subjects.find((s) => s.id === block.subjectId);
                return (
                  <div key={block.id} className="bg-white/10 border border-white/20 p-3 rounded space-y-2">
                    <select
                      value={block.subjectId}
                      onChange={(e) => updateBlock(block.id, { subjectId: Number(e.target.value) })}
                      className="w-full p-2 rounded bg-white/20"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={block.start}
                        onChange={(e) => updateBlock(block.id, { start: e.target.value })}
                        className="flex-1 p-2 rounded bg-white/20"
                      />
                      <input
                        type="time"
                        value={block.end}
                        onChange={(e) => updateBlock(block.id, { end: e.target.value })}
                        className="flex-1 p-2 rounded bg-white/20"
                      />
                    </div>
                    <button onClick={() => removeBlock(block.id)} className="text-red-400 text-sm">Remove</button>
                  </div>
                );
              })}
              <button onClick={addBlock} className="w-full py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">+ Add Subject / Break</button>
            </div>
          ) : (
            <div className="text-center p-4 bg-yellow-500/20 rounded text-yellow-200 font-medium">
              Holiday
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={saveSchedule}
            className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4"
          >
            {saving ? "Saving..." : "Save Schedule"}
          </button>
        </div>
      )}

      {/* JOB MODE */}
      {selectMode === "job" && (
        <div className="p-4 bg-green-900/30 rounded-lg text-white text-center font-medium">
          {/* You can add Job schedule list or CRUD here */}
         <CreateWorkShift />
        </div>
      )}

      {/* EVENT MODE */}
      {selectMode === "event" && (
        <div className="p-4 bg-purple-900/30 rounded-lg text-white text-center font-medium">
          {/* You can add Event schedule list or CRUD here */}
          <p>Event Schedule Editor Coming Soon</p>
        </div>
      )}

    </div>
  );
}