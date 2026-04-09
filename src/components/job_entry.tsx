'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Job = {
  id: number;
  job_name: string;
  hourly_rate: number;
};

type ActiveShift = {
  id: number;
  start_time: string;
  end_time?: string;
  job_id: number;
};

export default function JobEntry() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState("");
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [liveMinutes, setLiveMinutes] = useState(0);
  const [message, setMessage] = useState("");
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [breakMinutes, setBreakMinutes] = useState(0);

  useEffect(() => {
    loadJobs();
    checkActiveShift();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (activeShift) {
      timer = setInterval(() => {
        const start = new Date(
          `2000-01-01T${customStartTime || activeShift.start_time}`
        );

        const now = new Date(
          `2000-01-01T${new Date().toTimeString().slice(0, 5)}`
        );

        // midnight crossover fix
        if (now < start) {
          now.setDate(now.getDate() + 1);
        }

        const diff = (now.getTime() - start.getTime()) / 60000;

        setLiveMinutes(Math.max(0, Math.floor(diff)));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [activeShift, customStartTime]);

  async function loadJobs() {
    const { data } = await supabase.from("jobs").select("*").order("id");
    if (data) setJobs(data);
  }

  async function checkActiveShift() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("work_shifts")
      .select("*")
      .eq("user_id", user.id)
      .is("end_time", null)
      .maybeSingle();

    if (data) setActiveShift(data);
  }

  async function startWork() {
    if (!jobId) {
      setMessage("⚠️ Select a job first");
      return;
    }

    const now = new Date().toTimeString().slice(0, 5);
    const startTime = customStartTime || now;
    const today = new Date().toISOString().split("T")[0];

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("⚠️ Login required");
      return;
    }

    const { data, error } = await supabase
      .from("work_shifts")
      .insert([
        {
          user_id: user.id,
          job_id: Number(jobId),
          work_date: today,
          start_time: startTime,
        },
      ])
      .select()
      .single();

    if (error) {
      setMessage("❌ Start failed");
      console.log(error);
      return;
    }

    setActiveShift(data);
    setLiveMinutes(0);
    setMessage("✅ Work started");
  }

  async function finishWork() {
    if (!activeShift) return;

    const endTime = customEndTime || new Date().toTimeString().slice(0, 5);

    const selectedJob = jobs.find((j) => j.id === activeShift.job_id);
    if (!selectedJob) return;

    const start = new Date(
      `2000-01-01T${customStartTime || activeShift.start_time}`
    );

    const end = new Date(`2000-01-01T${endTime}`);

    // midnight crossover fix
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    let totalMinutes =
      (end.getTime() - start.getTime()) / 60000 - breakMinutes;

    // prevent negative values
    totalMinutes = Math.max(0, totalMinutes);

    // prevent impossible break
    if (breakMinutes > totalMinutes) {
      setMessage("⚠️ Break exceeds work time");
      return;
    }

    const salary = (totalMinutes / 60) * selectedJob.hourly_rate;

    const { error } = await supabase
      .from("work_shifts")
      .update({
        end_time: endTime,
        worked_minutes: totalMinutes,
        break_minutes: breakMinutes,
        daily_salary: salary,
      })
      .eq("id", activeShift.id);

    if (error) {
      setMessage("❌ Finish failed");
      console.log(error);
      return;
    }

    setActiveShift(null);
    setLiveMinutes(0);
    setCustomStartTime("");
    setCustomEndTime("");
    setBreakMinutes(0);

    setMessage(
      `✅ Finished | ${Math.floor(totalMinutes)} min | ¥${salary.toFixed(0)}`
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-900 to-black flex justify-center items-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl p-8 text-white">
        <h1 className="text-3xl font-bold text-center mb-6">Shift Manager ✨</h1>

        {!activeShift && (
          <>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 mb-4"
            >
              <option value="">Select Job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.job_name} ¥{job.hourly_rate}/h
                </option>
              ))}
            </select>

            <label className="block text-sm opacity-70 mb-1">
              Optional Start Time
            </label>

            <input
              type="time"
              value={customStartTime}
              onChange={(e) => setCustomStartTime(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white/10 mb-6"
            />
          </>
        )}

        {activeShift && (
          <div className="text-center mb-6">
            <div className="text-5xl font-bold">{liveMinutes} min</div>

            <div className="text-sm opacity-70 mt-2">
              Started at {customStartTime || activeShift.start_time}
            </div>

            <label className="block text-sm opacity-70 mt-4 mb-1">
              Optional End Time
            </label>

            <input
              type="time"
              value={customEndTime}
              onChange={(e) => setCustomEndTime(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white/10 mb-4"
            />

            <label className="block text-sm opacity-70 mt-4 mb-1">
              Break Time (minutes)
            </label>

            <input
              type="number"
              min={0}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="w-full p-3 rounded-2xl bg-white/10 mb-4"
            />
          </div>
        )}

        {!activeShift ? (
          <button
            onClick={startWork}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 font-semibold transition"
          >
            Start Work
          </button>
        ) : (
          <button
            onClick={finishWork}
            className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-400 font-semibold transition"
          >
            Finish Work
          </button>
        )}

        {message && <div className="mt-5 text-center text-sm">{message}</div>}
      </div>
    </div>
  );
}
