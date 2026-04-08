'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format, parseISO } from "date-fns";

type ShiftType = {
  id?: number;
  user_id: string;
  type: "school" | "part_time" | "custom";
  title: string;           // job name / subject / custom event
  start_time: string;       // HH:mm
  end_time: string;         // HH:mm
  break_minutes?: number;   // optional
  date: string;             // YYYY-MM-DD
  daily_salary:number;
};

export default function ShiftView() {
  const [shifts, setShifts] = useState<ShiftType[]>([]);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadShifts();
  }, []);

  async function loadShifts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    if (data) setShifts(data);
  }

  // Get shifts for selected date
  const dailyShifts = shifts.filter((s) => s.date === selectedDate);

  // Calendar helper: all days of current month
  const today = new Date(selectedDate);
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(year, month, i + 1).toISOString().split("T")[0]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-900 to-black p-4 text-white">
      <div className="max-w-6xl mx-auto rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl p-6">

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Shift Overview</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded-2xl ${view === "calendar" ? "bg-emerald-500/80" : "bg-white/10"} transition`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-2xl ${view === "list" ? "bg-emerald-500/80" : "bg-white/10"} transition`}
            >
              List
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {view === "calendar" && (
          <div className="grid grid-cols-7 gap-1 mb-6">
            {calendarDays.map((day) => {
              const dayShifts = shifts.filter((s) => s.date === day);
              return (
                <div
                  key={day}
                  className={`border border-white/10 rounded-lg p-2 flex flex-col gap-1 min-h-[60px] ${
                    day === selectedDate ? "bg-emerald-500/30" : "bg-white/5"
                  } cursor-pointer`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-xs opacity-70">{format(parseISO(day), "EEE dd")}</div>
                  {dayShifts.slice(0, 2).map((s, idx) => (
                    <div
                      key={idx}
                      className={`text-[10px] p-1 rounded-lg ${
                        s.type === "school"
                          ? "bg-blue-500/60"
                          : s.type === "part_time"
                          ? "bg-emerald-500/60"
                          : "bg-purple-500/60"
                      }`}
                    >
                      {s.title} ({s.start_time}-{s.end_time})
                    </div>
                  ))}
                  {dayShifts.length > 2 && (
                    <div className="text-[10px] opacity-60">
                      +{dayShifts.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="space-y-4">
            {dailyShifts.length === 0 ? (
              <div className="text-center opacity-50 py-6">No shifts for this day</div>
            ) : (
              dailyShifts.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl bg-white/5 border border-white/10 shadow-md flex justify-between items-center`}
                >
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm opacity-70">{s.type.toUpperCase()}</div>
                    <div className="text-xs opacity-60">{s.start_time} → {s.end_time}</div>
                  </div>
                  {s.type === "part_time" && (
                    <div className="text-sm text-right">
                      Break: {s.break_minutes || 0} min<br/>
                      Salary: ¥{s.daily_salary || 0}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}