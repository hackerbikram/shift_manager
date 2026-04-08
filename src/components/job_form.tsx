'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { JobType } from "@/types/job";

type Props = {
  job?: JobType; // if editing, job will be passed
  onSave?: (job: JobType) => void; // callback after create/edit
  onCancel?: () => void; // close modal callback
};

export default function CreateJob({ job, onSave, onCancel }: Props) {
  const [jobName, setJobName] = useState<string>(job?.job_name || "");
  const [hourlyRate, setHourlyRate] = useState<string>(job?.hourly_rate?.toString() || "");
  const [pay_period_start,setPay_period_start] = useState<string>(job?.pay_period_start?.toString() || "");
  const [pay_period_end,setPay_period_end] = useState<string>(job?.pay_period_end?.toString() || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (job) {
      setJobName(job.job_name);
      setHourlyRate(job.hourly_rate?.toString() || "");
      setPay_period_start(job.pay_period_start?.toString || "");
      setPay_period_end(job.pay_period_end?.toString || "");
    }
  }, [job]);

  const saveJob = async () => {
    if (!jobName || !hourlyRate || !pay_period_start || !pay_period_end) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("User not found");
      setLoading(false);
      return;
    }

    let error = null;
    let savedJob: JobType | null = null;

    if (job?.id) {
      // Edit existing job
      const { data, error: editError } = await supabase
        .from("jobs")
        .update({
          job_name: jobName,
          hourly_rate: Number(hourlyRate),
        })
        .eq("id", job.id)
        .select()
        .single();
      error = editError;
      savedJob = data || null;
    } else {
      // Create new job
      const { data, error: createError } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          job_name: jobName,
          hourly_rate: Number(hourlyRate),
        })
        .select()
        .single();
      error = createError;
      savedJob = data || null;
    }

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(job?.id ? "Job updated successfully ✨" : "Job created successfully ✨");
    setJobName("");
    setHourlyRate("");
    setLoading(false);

    if (onSave && savedJob) onSave(savedJob);
    if (onCancel) onCancel();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white/30 backdrop-blur-xl border border-black/40 shadow-2xl p-6 text-black">
        <h1 className="text-2xl font-bold text-center mb-6">
          {job?.id ? "Edit Job" : "Create Job"}
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Job Name"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white/50 border border-black/50 outline-none"
          />

          <input
            type="number"
            placeholder="Hourly Rate"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white/50 border border-black/50 outline-none"
          />
          <label>Start Day of Pay Period (1–31)</label>
<input
  type="number"
  min={1}
  max={31}
  value={pay_period_start}
  onChange={(e) => setPay_period_start(e.target.value)}
  className="w-full p-4 rounded-2xl bg-white/50 border border-black/50 outline-none"
/>

<label>End Day of Pay Period (1–31)</label>
<input
  type="number"
  min={1}
  max={31}
  value={pay_period_end}
  onChange={(e) => setPay_period_end(e.target.value)}
  className="w-full p-4 rounded-2xl bg-white/50 border border-black/50 outline-none"
/>


          <button
            onClick={saveJob}
            disabled={loading}
            className="w-full p-4 rounded-2xl bg-black/60 border border-white/50 text-white hover:bg-black/80 transition"
          >
            {loading ? "Saving..." : job?.id ? "Update Job" : "Create Job"}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full p-4 rounded-2xl bg-red-500 text-white hover:bg-red-400 transition"
            >
              Cancel
            </button>
          )}

          {message && (
            <div className="text-center text-sm mt-4">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}