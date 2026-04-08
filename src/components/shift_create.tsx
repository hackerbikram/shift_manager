'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type ShiftType = {
  id?: number;
  user_id: string;
  type: "school" | "part_time" | "custom";
  title: string;           // job name / subject / custom event
  start_time: string;       // HH:mm
  end_time: string;         // HH:mm
  break_minutes?: number;   // optional
  date: string;             // YYYY-MM-DD
};

type Props = {
  onSave?: () => void;
};

export default function CreateShiftPage({ onSave }: Props) {
  const [shiftType, setShiftType] = useState<ShiftType["type"]>("school");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    fetchUser();
  }, []);

  const saveShift = async () => {
    if (!title || !startTime || !endTime || !userId) {
      setMessage("Please fill all required fields");
      return;
    }

    setLoading(true);
    setMessage("");

    const shift: ShiftType = {
      user_id: userId,
      type: shiftType,
      title,
      start_time: startTime,
      end_time: endTime,
      break_minutes: breakMinutes,
      date,
    };

    const { error } = await supabase.from("shifts").insert(shift);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Shift created successfully ✨");
    setTitle("");
    setStartTime("");
    setEndTime("");
    setBreakMinutes(0);
    setShiftType("school");
    setDate(new Date().toISOString().split("T")[0]);

    setLoading(false);
    if (onSave) onSave();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl p-6 text-white">
        <h1 className="text-2xl font-bold text-center mb-6">Create Shift</h1>

        <div className="space-y-4">

          <select
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value as ShiftType["type"])}
            className="w-full p-3 rounded-2xl bg-white/10 text-white"
          >
            <option value="school">School</option>
            <option value="part_time">Part-Time Job</option>
            <option value="custom">Custom Event</option>
          </select>

          <input
            type="text"
            placeholder={shiftType === "school" ? "Subject Name" : shiftType === "part_time" ? "Job Name" : "Event Title"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white/10 text-white placeholder:text-white/60"
          />

          <div className="flex gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-1/2 p-3 rounded-2xl bg-white/10 text-white"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-1/2 p-3 rounded-2xl bg-white/10 text-white"
            />
          </div>

          <input
            type="number"
            placeholder="Break Minutes (optional)"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(Number(e.target.value))}
            className="w-full p-3 rounded-2xl bg-white/10 text-white"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white/10 text-white"
          />

          <button
            onClick={saveShift}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-emerald-500/80 hover:bg-emerald-500 font-semibold transition"
          >
            {loading ? "Saving..." : "Save Shift"}
          </button>

          {message && (
            <div className="text-center text-sm mt-4 text-white/80">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}