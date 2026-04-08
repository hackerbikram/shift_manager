"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import type { JobType } from "@/types/job";

type Shift = {
  job_id: string;
  job_name: string;
  start_time: string;
  end_time: string;
  break_time: number; // in minutes
};

type DayShift = {
  shifts: Shift[];
};

type WeekDays = {
  Sunday: DayShift;
  Monday: DayShift;
  Tuesday: DayShift;
  Wednesday: DayShift;
  Thursday: DayShift;
  Friday: DayShift;
  Saturday: DayShift;
};

type WorkShift = {
  id: string;
  user_id: string;
  week_schedule: WeekDays;
};

export default function CreateWorkShift() {
  const [workShift, setWorkShift] = useState<WorkShift | null>(null);
  const [currentDay, setCurrentDay] = useState<keyof WeekDays>("Monday");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobType[]>([]);

  const week = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;

  // Get user ID
  async function getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? "";
  }

  // Load Jobs from DB
  const loadJobs = async () => {
    const user_id = await getUserId();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user_id)
      .order("id");

    if (error || !data) {
      console.error("Failed to load jobs:", error?.message);
      setJobs([]);
      return;
    }

    setJobs(data as JobType[]);
  };

  // Load WorkShift from DB
  const loadWorkShift = async () => {
    setLoading(true);
    const user_id = await getUserId();
    if (!user_id) return;

    const { data, error } = await supabase
      .from("work_shifts")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load work shift:", error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setWorkShift(data as WorkShift);
    } else {
      const emptySchedule: WeekDays = {
        Sunday: { shifts: [] },
        Monday: { shifts: [] },
        Tuesday: { shifts: [] },
        Wednesday: { shifts: [] },
        Thursday: { shifts: [] },
        Friday: { shifts: [] },
        Saturday: { shifts: [] },
      };
      setWorkShift({ id: "", user_id, week_schedule: emptySchedule });
    }
    setLoading(false);
  };

  // Save / Upsert
  const saveWorkShift = async () => {
    if (!workShift) return;
    setLoading(true);
    const user_id = await getUserId();
    const { error } = await supabase
      .from("work_shifts")
      .upsert([{ ...workShift, user_id }]);

    if (error) console.error("Failed to save:", error.message);
    setLoading(false);
  };

  // Add shift
  const addShift = () => {
    if (!workShift) return;
    const newShift: Shift = {
      job_id: String(jobs[0]?.id ?? ""),
      job_name: jobs[0]?.job_name ?? "Job",
      start_time: "09:00",
      end_time: "17:00",
      break_time: 60,
    };
    const updatedWeek = { ...workShift.week_schedule };
    updatedWeek[currentDay].shifts.push(newShift);
    setWorkShift({ ...workShift, week_schedule: updatedWeek });
  };

  // Update shift
  const updateShift = (index: number, patch: Partial<Shift>) => {
    if (!workShift) return;
    const updatedWeek = { ...workShift.week_schedule };
    const currentShifts = updatedWeek[currentDay].shifts;
    if (!currentShifts[index]) return;
    updatedWeek[currentDay].shifts[index] = { ...currentShifts[index], ...patch };
    setWorkShift({ ...workShift, week_schedule: updatedWeek });
  };

  // Remove shift
  const removeShift = (index: number) => {
    if (!workShift) return;
    const updatedWeek = { ...workShift.week_schedule };
    updatedWeek[currentDay].shifts = updatedWeek[currentDay].shifts.filter((_, i) => i !== index);
    setWorkShift({ ...workShift, week_schedule: updatedWeek });
  };

  useEffect(() => {
    loadJobs();
    loadWorkShift();
  }, []);

  if (loading || !workShift) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 bg-neutral-900 min-h-screen text-white rounded-2xl">
      {/* Weekday Selector */}
      <div className="flex gap-2 overflow-x-auto">
        {week.map((d) => (
          <button
            key={d}
            onClick={() => setCurrentDay(d)}
            className={`flex-1 py-2 rounded text-sm font-semibold ${
              currentDay === d ? "bg-emerald-500 text-black" : "bg-white/10 text-white"
            }`}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Shifts List */}
      <div className="space-y-2">
        {workShift.week_schedule[currentDay].shifts.map((shift, idx) => (
          <div key={idx} className="bg-white/10 border border-white/20 p-3 rounded space-y-2">
            {/* Job Selector */}
            <select
              value={shift.job_id}
              onChange={(e) => {
                const selected = jobs.find(j => String(j.id) === e.target.value);
                updateShift(idx, { job_id: e.target.value, job_name: selected?.job_name ?? selected?.job_name ?? "" });
              }}
              className="w-full p-2 rounded bg-white/20 text-black"
            >
              {jobs.map((job) => (
                <option key={String(job.id)} value={String(job.id)}>{job.job_name ?? job.job_name}</option>
              ))}
            </select>

            {/* Start/End */}
            <div className="flex gap-2">
              <input
                type="time"
                value={shift.start_time}
                onChange={(e) => updateShift(idx, { start_time: e.target.value })}
                className="flex-1 p-2 rounded bg-white/20 text-black"
              />
              <input
                type="time"
                value={shift.end_time}
                onChange={(e) => updateShift(idx, { end_time: e.target.value })}
                className="flex-1 p-2 rounded bg-white/20 text-black"
              />
            </div>

            {/* Break */}
            <input
              type="number"
              value={shift.break_time}
              onChange={(e) => updateShift(idx, { break_time: Number(e.target.value) })}
              className="w-full p-2 rounded bg-white/20 text-black"
              placeholder="Break (minutes)"
            />

            <button
              onClick={() => removeShift(idx)}
              className="text-red-400 text-sm mt-1"
            >
              Remove Shift
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addShift}
        className="w-full py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
      >
        + Add Shift
      </button>

      <button
        onClick={saveWorkShift}
        className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
      >
        Save All Shifts
      </button>
    </div>
  );
}