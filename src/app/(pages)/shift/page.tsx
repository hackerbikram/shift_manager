'use client'
import Schedulercreater from "@/components/shift_components/shift_create"
import ShiftCalendar from "@/components/shift_components/shift_calander"
export default function ShiftPage(){
  return (
    <div>
      <Schedulercreater />
      <div>
        <ShiftCalendar />
      </div>
    </div>
  )
}