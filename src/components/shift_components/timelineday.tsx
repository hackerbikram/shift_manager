"use client"

import { useState, useEffect } from "react"
import type { UniversalShift } from "@/types/shift-type"

type Props = {
  shifts: UniversalShift[]
  draftShift?: UniversalShift | null
  onAdd: (shift: UniversalShift) => void
  onDelete?: (id: string) => void
  onUpdate?: (shift: UniversalShift) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function TimelineDay({
  shifts,
  onAdd,
  draftShift,
  onDelete,
  onUpdate
}: Props) {

  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragEnd, setDragEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const pxPerHour = 60

  // drag logic same...

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) setIsDragging(false)
    }
    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp)
  }, [isDragging])

  const sortedShifts = [...shifts].sort((a, b) =>
    a.start.localeCompare(b.start)
  )

  return (
    <div className="space-y-2">

      <div className="relative border border-white/10 rounded-xl overflow-hidden">

        {HOURS.map((h) => (
          <div
            key={h}
            onMouseDown={() => {
              setIsDragging(true)
              setDragStart(h)
              setDragEnd(h)
            }}
            onMouseEnter={() => {
              if (isDragging) setDragEnd(h)
            }}
            onMouseUp={() => setIsDragging(false)}
            className="h-[60px] border-b border-white/10 text-xs pl-2 cursor-pointer"
          >
            {String(h).padStart(2, "0")}:00
          </div>
        ))}

        {/* shifts */}
        {sortedShifts.map((s) => {
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
              {editingId === s.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e)=>setEditTitle(e.target.value)}
                    className="text-black w-full"
                  />

                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => {
                        onUpdate?.({ ...s, title: editTitle })
                        setEditingId(null)
                      }}
                      className="bg-green-500 px-2 rounded"
                    >
                      ✔
                    </button>

                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 px-2 rounded"
                    >
                      ✖
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>{s.title}</div>
                  <div className="text-[10px]">{s.start}-{s.end}</div>

                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => {
                        setEditingId(s.id!)
                        setEditTitle(s.title)
                      }}
                      className="bg-blue-500 px-2 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete?.(s.id!)}
                      className="bg-red-500 px-2 rounded"
                    >
                      Del
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* confirm add */}
      {dragStart !== null && dragEnd !== null && dragStart !== dragEnd && (
        <button
          className="bg-green-500 px-3 py-1 rounded"
          onClick={() => {
            const start = Math.min(dragStart, dragEnd)
            const end = Math.max(dragStart, dragEnd) + 1

            const base = draftShift ?? {
              type: "event",
              title: "New Shift",
              color: "#3b82f6",
            }

            onAdd({
              id: crypto.randomUUID(),
              ...base,
              start: `${String(start).padStart(2, "0")}:00`,
              end: `${String(end).padStart(2, "0")}:00`,
            })

            setDragStart(null)
            setDragEnd(null)
          }}
        >
          Confirm
        </button>
      )}
    </div>
  )
}