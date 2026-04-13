"use client";

import { supabase } from "@/lib/supabase";
import type { Subject } from "@/types/subject";
import { useEffect, useState } from "react";

type Props = {
  onCreated?: () => void;
  onUpdated?: () => void;
  initialData?: Subject | null;
  mode?: "create" | "edit";
};

export default function SubjectCreateForm({
  onCreated,
  onUpdated,
  initialData,
  mode = "create",
}: Props) {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  const [subject, setSubject] = useState<Subject>({
    user_id: "",
    name: "",
    teacher: "",
    room: "",
    color: "#6366f1",
    duration_minutes: 50,
  });

  // 🔐 Load user
  useEffect(() => {
    loadUser();
  }, []);

  // ✏️ If edit mode → load initial data
  useEffect(() => {
    if (initialData) {
      setSubject(initialData);
    }
  }, [initialData]);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);

      setSubject((prev) => ({
        ...prev,
        user_id: user.id,
      }));
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setSubject((prev) => ({
      ...prev,
      [name]:
        name === "duration_minutes"
          ? Number(value)
          : value,
    }));
  };

  // 🚀 SUBMIT HANDLER (CREATE + UPDATE)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!subject.name || !userId) {
      setMessage("Subject name required");
      return;
    }

    if (mode === "create") {
      const { error } = await supabase.from("subjects").insert({
        ...subject,
        user_id: userId,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Subject created ✅");
      onCreated && onCreated();
    }

    if (mode === "edit" && subject.id) {
      const { error } = await supabase
        .from("subjects")
        .update({
          name: subject.name,
          teacher: subject.teacher,
          room: subject.room,
          color: subject.color,
          duration_minutes: subject.duration_minutes,
        })
        .eq("id", subject.id);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Subject updated ✏️");
      onUpdated && onUpdated();
    }

    // reset only in create mode
    if (mode === "create") {
      setSubject({
        user_id: userId,
        name: "",
        teacher: "",
        room: "",
        color: "#6366f1",
        duration_minutes: 50,
      });
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 rounded-2xl bg-zinc-900 border border-white/10 text-white">

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="name"
          placeholder="Subject Name"
          value={subject.name}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-white/10"
        />

        <input
          type="text"
          name="teacher"
          placeholder="Teacher"
          value={subject.teacher}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-white/10"
        />

        <input
          type="text"
          name="room"
          placeholder="Room"
          value={subject.room}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-white/10"
        />

        <input
          type="color"
          name="color"
          value={subject.color}
          onChange={handleChange}
          className="w-full h-12 rounded-xl"
        />

        <input
          type="number"
          name="duration_minutes"
          value={subject.duration_minutes}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-white/10"
        />

        <button
          type="submit"
          className={`w-full p-3 rounded-xl font-semibold ${
            mode === "edit"
              ? "bg-blue-500"
              : "bg-emerald-500"
          }`}
        >
          {mode === "edit" ? "Update Subject" : "Save Subject"}
        </button>

        {message && (
          <div className="text-center text-sm text-emerald-400">
            {message}
          </div>
        )}

      </form>
    </div>
  );
}