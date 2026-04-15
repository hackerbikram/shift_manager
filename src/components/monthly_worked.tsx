"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Job = {
  id: number;
  job_name: string;
  hourly_rate: number;
  pay_period_start: number;
  pay_period_end: number;
};

type Shift = {
  id: number;
  work_date: string;
  start_time: string;
  end_time: string;
  worked_minutes: number;
  break_minutes: number;
  daily_salary: number;
  jobs: Job | null;
};

export default function MonthlyWork() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [monthFilter, setMonthFilter] = useState<"this" | "prev" | "custom">("this");
  const [customMonth, setCustomMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Shift>>({});

  useEffect(() => {
    loadJobs();
  }, []);

  function calculateShift(data: Partial<Shift>, job: Job | null) {
  if (!data.start_time || !data.end_time || !job) return data;

  const start = new Date(`1970-01-01T${data.start_time}`);
  const end = new Date(`1970-01-01T${data.end_time}`);

  let minutes = (end.getTime() - start.getTime()) / 60000;

  if (minutes < 0) minutes += 1440; // overnight shift

  const breakMin = data.break_minutes || 0;
  const worked = Math.max(0, minutes - breakMin);
  const salary = (worked / 60) * job.hourly_rate;

  return {
    ...data,
    worked_minutes: Math.round(worked),
    daily_salary: Math.round(salary),
  };
}

function startEdit(shift: Shift) {
  setEditingId(shift.id);
  setEditData({ ...shift });
}

async function saveEdit() {
  if (!editingId) return;

  const job = jobs.find(j => j.id === editData.jobs?.id) || null;
  const calculated = calculateShift(editData, job);

  const { error } = await supabase
    .from("work_shifts")
    .update({
      work_date: calculated.work_date,
      start_time: calculated.start_time,
      end_time: calculated.end_time,
      break_minutes: calculated.break_minutes,
      worked_minutes: calculated.worked_minutes,
      daily_salary: calculated.daily_salary,
    })
    .eq("id", editingId);

  if (error) {
    console.log(error);
    return;
  }

  setEditingId(null);
  setEditData({});
  await loadMonthlyWork(); // 🔥 ensures totals update
}

useEffect(() => {
  if (!editingId) return;

  const job = jobs.find(j => j.id === editData.jobs?.id) || null;
  const updated = calculateShift(editData, job);

  setEditData(prev => ({
    ...prev,
    worked_minutes: updated.worked_minutes,
    daily_salary: updated.daily_salary,
  }));
}, [
  editData.start_time,
  editData.end_time,
  editData.break_minutes
]);

  useEffect(() => {
    setSelectedJob(jobId ? jobs.find(j => j.id === Number(jobId)) || null : null);
  }, [jobId, jobs]);

  useEffect(() => {
    loadMonthlyWork();
  }, [selectedJob, jobId, monthFilter, customMonth]);

  async function loadJobs() {
    const { data, error } = await supabase.from("jobs").select("*").order("id");
    if (error) return console.log(error);
    if (data) setJobs(data);
  }

  async function loadMonthlyWork() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    let filterMonth = now;
    if (monthFilter === "prev") filterMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    else if (monthFilter === "custom") {
      const [y, m] = customMonth.split("-");
      filterMonth = new Date(Number(y), Number(m) - 1, 1);
    }

    // Default pay period
    let startDay = 1;
    let endDay = 0;
    if (selectedJob) {
      startDay = selectedJob.pay_period_start || 1;
      endDay = selectedJob.pay_period_end || 0;
    }

    let payStart: string;
    let payEnd: string;

    // Adjust pay period to month
    if (filterMonth.getDate() >= startDay) {
      payStart = new Date(filterMonth.getFullYear(), filterMonth.getMonth(), startDay).toISOString().split("T")[0];
      payEnd = new Date(filterMonth.getFullYear(), filterMonth.getMonth() + 1, endDay || 0).toISOString().split("T")[0];
    } else {
      payStart = new Date(filterMonth.getFullYear(), filterMonth.getMonth() - 1, startDay).toISOString().split("T")[0];
      payEnd = new Date(filterMonth.getFullYear(), filterMonth.getMonth(), endDay || 0).toISOString().split("T")[0];
    }

    let query = supabase
      .from("work_shifts")
      .select(`
        *,
        jobs (
          id,
          job_name,
          hourly_rate,
          pay_period_start,
          pay_period_end
        )
      `)
      .eq("user_id", user.id)
      .gte("work_date", payStart)
      .lte("work_date", payEnd)
      .order("work_date", { ascending: false });

    if (jobId) query = query.eq("job_id", Number(jobId));

    const { data, error } = await query;
    if (error) return console.log(error);

    if (!data) {
      setShifts([]);
      setTotalMinutes(0);
      setTotalSalary(0);
      return;
    }

    setShifts(data);
    setTotalMinutes(data.reduce((sum, s) => sum + (s.worked_minutes || 0), 0));
    setTotalSalary(data.reduce((sum, s) => sum + (s.daily_salary || 0), 0));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-900 to-black p-4 text-white">
      <div className="max-w-5xl mx-auto rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl p-6">

        {/* Month Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value as any)}
            className="w-full sm:w-auto p-3 rounded-2xl bg-white/10 text-white"
          >
            <option value="this">This Month</option>
            <option value="prev">Previous Month</option>
            <option value="custom">Custom</option>
          </select>

          {monthFilter === "custom" && (
            <input
              type="month"
              value={customMonth}
              onChange={(e) => setCustomMonth(e.target.value)}
              className="w-full sm:w-auto p-3 rounded-2xl bg-white/10 text-white"
            />
          )}

          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full sm:w-auto p-3 rounded-2xl bg-white/10 text-white"
          >
            <option value="">All Jobs</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.job_name} ¥{j.hourly_rate}/h
              </option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <h1 className="text-3xl font-bold mb-6">Pay Period Work Summary 📊</h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-sm opacity-70">Total Hours</div>
            <div className="text-2xl font-bold">{(totalMinutes / 60).toFixed(1)} h</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-sm opacity-70">Total Minutes</div>
            <div className="text-2xl font-bold">{totalMinutes} min</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-sm opacity-70">Total Income</div>
            <div className="text-2xl font-bold">¥{totalSalary.toFixed(0)}</div>
          </div>
        </div>

        <div className="space-y-4">
  {shifts.length === 0 ? (
    <div className="text-center opacity-60 py-10">No work records found</div>
  ) : (
    shifts.map((shift) => {
      const isEditing = editingId === shift.id;

      return (
        <div
          key={shift.id}
          className="rounded-2xl bg-white/5 p-4 border border-white/10"
        >
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={editData.work_date || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, work_date: e.target.value })
                  }
                  className="p-2 rounded bg-white/10"
                />

                <input
                  type="number"
                  placeholder="Break (min)"
                  value={editData.break_minutes || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      break_minutes: Number(e.target.value),
                    })
                  }
                  className="p-2 rounded bg-white/10"
                />

                <input
                  type="time"
                  value={editData.start_time || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, start_time: e.target.value })
                  }
                  className="p-2 rounded bg-white/10"
                />

                <input
                  type="time"
                  value={editData.end_time || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, end_time: e.target.value })
                  }
                  className="p-2 rounded bg-white/10"
                />
              </div>

              {/* 🔥 Live Preview */}
              <div className="mt-3 text-sm opacity-80">
                Worked: {editData.worked_minutes || 0} min | Salary: ¥
                {editData.daily_salary || 0}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={saveEdit}
                  disabled={!editData.start_time || !editData.end_time}
                  className="bg-green-500 px-3 py-1 rounded disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditData({});
                  }}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">
                    {shift.jobs?.job_name || "Unknown Job"}
                  </div>
                  <div className="text-sm opacity-70">{shift.work_date}</div>
                </div>
                <div className="text-right">
                  <div>
                    {shift.start_time} → {shift.end_time || "--:--"}
                  </div>
                  <div className="text-sm opacity-70">
                    {shift.worked_minutes || 0} min
                  </div>
                </div>
              </div>

              <div className="mt-2 text-sm opacity-80">
                Break: {shift.break_minutes || 0} min | Salary: ¥
                {shift.daily_salary || 0}
              </div>

              <button
                onClick={() => startEdit(shift)}
                className="mt-2 bg-blue-500 px-3 py-1 rounded"
              >
                Edit
              </button>
            </>
          )}
        </div>
      );
    })
  )}
</div>
        </div>
      </div>
  );
}