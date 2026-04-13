'use client'

import { useState, useEffect } from "react"
import type { UniversalShift } from "@/types/shift-type"

type Props = {
  shifts: UniversalShift[]
  draftShift?: UniversalShift | null
  onAdd: (shift: UniversalShift) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function TimelineDay({ shifts, onAdd }: Props) {
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragEnd, setDragEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const pxPerHour = 60

  // ✅ Start drag
  const handleMouseDown = (hour: number) => {
    setIsDragging(true)
    setDragStart(hour)
    setDragEnd(hour)
  }

  // ✅ Update drag
  const handleMouseEnter = (hour: number) => {
    if (!isDragging) return
    setDragEnd(hour)
  }

  // ✅ End drag
  const handleMouseUp = () => {
    if (!isDragging) return

    setIsDragging(false)

    // ❗ Ignore single click
    if (dragStart === dragEnd) {
      setDragStart(null)
      setDragEnd(null)
      return
    }
  }

  // ✅ Global mouse up (important)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) setIsDragging(false)
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp)
  }, [isDragging])

  // ✅ ESC cancel
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDragStart(null)
        setDragEnd(null)
        setIsDragging(false)
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <div className="space-y-2">

      {/* ⏰ Timeline */}
      <div className="relative border border-white/10 rounded-xl overflow-hidden">

        {HOURS.map((h) => (
          <div
            key={h}
            onMouseDown={() => handleMouseDown(h)}
            onMouseEnter={() => handleMouseEnter(h)}
            onMouseUp={handleMouseUp}
            className="h-[60px] border-b border-white/10 flex items-start text-xs text-gray-400 pl-2 cursor-pointer hover:bg-white/5"
          >
            {String(h).padStart(2, "0")}:00
          </div>
        ))}

        {/* 🎯 Drag Preview */}
        {dragStart !== null && dragEnd !== null && (
          <div
            className="absolute left-0 right-0 bg-blue-500/40 border border-blue-400 rounded pointer-events-none"
            style={{
              top: Math.min(dragStart, dragEnd) * pxPerHour,
              height: (Math.abs(dragEnd - dragStart) + 1) * pxPerHour,
            }}
          />
        )}

        {/* 📦 Existing shifts */}
        {shifts.map((s) => {
          const startHour = parseInt(s.start.split(":")[0])
          const endHour = parseInt(s.end.split(":")[0])

          return (
            <div
              key={s.id}
              className="absolute left-10 right-2 rounded p-2 text-xs text-white shadow-lg"
              style={{
                top: startHour * pxPerHour,
                height: (endHour - startHour) * pxPerHour,
                backgroundColor: s.color,
              }}
            >
              {s.title}
              <br />
              {s.start} - {s.end}
            </div>
          )
        })}
      </div>

      {/* ✅ Confirm / Cancel OUTSIDE timeline */}
      {dragStart !== null && dragEnd !== null && dragStart !== dragEnd && (
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-green-500 rounded"
            onClick={() => {
              const start = Math.min(dragStart, dragEnd)
              const end = Math.max(dragStart, dragEnd) + 1

              onAdd({
                id: crypto.randomUUID(),
                type: "event",
                title: "New Shift",
                start: `${String(start).padStart(2, "0")}:00`,
                end: `${String(end).padStart(2, "0")}:00`,
                color: "#3b82f6",
              })

              setDragStart(null)
              setDragEnd(null)
            }}
          >
            Confirm
          </button>

          <button
            className="px-3 py-1 bg-red-500 rounded"
            onClick={() => {
              setDragStart(null)
              setDragEnd(null)
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}