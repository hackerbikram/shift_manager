'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import CreateJob from "@/components/job_form";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { JobType } from "@/types/job";

export default function JobPage() {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editJob, setEditJob] = useState<JobType | undefined>(undefined);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    const { data, error } = await supabase.from("jobs").select("*").order("id");
    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }
    if (data) setJobs(data);
    setLoading(false);
  }

  async function deleteJob(job: JobType) {
  if (!job.id) return; // <-- ensure id exists
  if (!confirm("Are you sure you want to delete this job?")) return;

  const { error } = await supabase.from("jobs").delete().eq("id", job.id);
  if (error) {
    alert("Failed to delete job");
    console.log(error);
    return;
  }

  setJobs(jobs.filter(j => j.id !== job.id));
}

  function handleEdit(job: JobType) {
    setEditJob(job);
    setShowCreate(true);
  }

  function handleCloseForm() {
    setEditJob(undefined);
    setShowCreate(false);
  }

  async function handleSave(job: JobType) {
    await loadJobs();
    handleCloseForm();
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white">Job List</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/80 hover:bg-emerald-500 transition font-semibold shadow-lg"
          >
            <Plus size={18} /> Add Job
          </button>
        </div>

        {/* Job List */}
        {loading ? (
          <div className="text-center py-10 opacity-70">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 opacity-50">No jobs found</div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div
                key={job.id}
                className="flex justify-between items-center p-4 rounded-2xl bg-white/5 backdrop-blur-md shadow-lg border border-white/10 transition hover:bg-white/10"
              >
                <div>
                  <div className="font-semibold text-white">{job.job_name}</div>
                  <div className="text-sm text-white/70">¥{job.hourly_rate}/h</div>
                </div>

                <div className="flex gap-2">
                  <button
  onClick={() => job.id && handleEdit(job)}
  className="p-2 rounded-xl hover:bg-white/10 transition"
  title="Edit Job"
>
  <Pencil size={18} />
</button>
                  <button
  onClick={() => job.id && deleteJob(job)}
  className="p-2 rounded-xl hover:bg-red-500/20 transition text-red-400"
  title="Delete Job"
>
  <Trash2 size={18} />
</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Job Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900/70 backdrop-blur-xl shadow-2xl border border-white/10 p-6 relative">
            <button
              onClick={handleCloseForm}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition text-lg font-bold"
            >
              ✕
            </button>
            <CreateJob
              job={editJob} // undefined when not editing
              onSave={handleSave}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}