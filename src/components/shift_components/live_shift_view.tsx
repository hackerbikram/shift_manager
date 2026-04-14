"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { WeeklyTemplate, UniversalShift } from "@/types/shift-type"

const daysMap: (keyof WeeklyTemplate)[] = [
  "sunday","monday","tuesday","wednesday","thursday","friday","saturday"
]

export default function LiveShiftViewer() {
  const [schedule, setSchedule] = useState<WeeklyTemplate | null>(null)
  const [currentShift, setCurrentShift] = useState<UniversalShift | null>(null)
  const [nextShift, setNextShift] = useState<UniversalShift | null>(null)

  const [now, setNow] = useState<Date | null>(null)
  const [selectedDay, setSelectedDay] = useState<keyof WeeklyTemplate>("monday")

  // ⏱ CLIENT CLOCK (fix hydration)
  useEffect(() => {
    setNow(new Date())

    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 📦 LOAD SCHEDULE
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("schedules")
        .select("schedule_json")
        .eq("user_id", user.id)
        .single()

      if (data?.schedule_json) {
        setSchedule(data.schedule_json)
      }
    }

    load()
  }, [])

  // 🧠 MAIN LOGIC (CURRENT + NEXT SHIFT)
  useEffect(() => {
    if (!schedule || !now) return

    const todayIndex = now.getDay()
    const currentTime = now.toTimeString().slice(0, 5)

    // 👉 CURRENT SHIFT (TODAY)
    const today = daysMap[todayIndex]
    const todayShifts = schedule[today] || []

    const active = todayShifts.find(
      s => s.start <= currentTime && s.end > currentTime
    )

    setCurrentShift(active || null)

    // 👉 NEXT SHIFT (SMART: TODAY → NEXT DAYS)
    let foundNext: UniversalShift | null = null

    // check today first
    const todayUpcoming = todayShifts
      .filter(s => s.start > currentTime)
      .sort((a, b) => a.start.localeCompare(b.start))

    if (todayUpcoming.length > 0) {
      foundNext = todayUpcoming[0]
    } else {
      // 🔥 check next days
      for (let i = 1; i <= 7; i++) {
        const nextDay = daysMap[(todayIndex + i) % 7]
        const shifts = schedule[nextDay] || []

        if (shifts.length > 0) {
          foundNext = shifts.sort((a, b) =>
            a.start.localeCompare(b.start)
          )[0]
          break
        }
      }
    }

    setNextShift(foundNext)

  }, [now, schedule])

  // 📅 SELECTED DAY SHIFTS
  const selectedShifts = schedule?.[selectedDay] || []

  return (
    <div className="p-4 rounded-2xl bg-zinc-900 text-white shadow-xl max-w-md mx-auto space-y-4">

      {/* ⏰ TIME */}
      <h2 className="text-center text-xl font-bold">
        {now ? now.toLocaleTimeString() : "--:--:--"}
      </h2>

      <p className="text-center text-sm text-gray-400">
        {now ? daysMap[now.getDay()].toUpperCase() : ""}
      </p>

      {/* 📅 MOBILE CALENDAR */}
      <div className="grid grid-cols-7 gap-1">
        {daysMap.map((d, i) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`text-xs p-2 rounded transition ${
              selectedDay === d
                ? "bg-emerald-500 text-black"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* 🔥 CURRENT SHIFT */}
      {currentShift ? (
        <div
          className="p-4 rounded-xl text-center shadow-lg animate-pulse"
          style={{ backgroundColor: currentShift.color }}
        >
          <h3 className="text-lg font-bold">{currentShift.title}</h3>
          <p>{currentShift.start} - {currentShift.end}</p>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          😴 No active shift
        </div>
      )}

      {/* 🚀 NEXT SHIFT */}
      {nextShift && (
        <div className="p-3 rounded-xl bg-white/10 text-center border border-white/10">
          <p className="text-xs text-gray-400">Next Shift</p>
          <h3 className="font-semibold">{nextShift.title}</h3>
          <p className="text-sm">
            {nextShift.start} - {nextShift.end}
          </p>
        </div>
      )}

      {/* 📋 DAY VIEW (LIKE MOBILE CALENDAR LIST) */}
      <div className="space-y-2">
        <h3 className="text-sm text-gray-400 text-center">
          {selectedDay.toUpperCase()} SCHEDULE
        </h3>

        {selectedShifts.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">
            No shifts
          </p>
        ) : (
          selectedShifts
            .sort((a, b) => a.start.localeCompare(b.start))
            .map(s => (
              <div
                key={s.id}
                className="p-3 rounded-xl flex justify-between items-center shadow"
                style={{ backgroundColor: s.color }}
              >
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-xs">
                    {s.start} - {s.end}
                  </p>
                </div>

                {/* 🔥 CURRENT INDICATOR */}
                {currentShift?.id === s.id && (
                  <span className="text-xs bg-black/40 px-2 py-1 rounded">
                    LIVE
                  </span>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  )
}