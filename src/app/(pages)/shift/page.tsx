'use client'
import Schedulercreater from "@/components/shift_components/shift_create";
import  ShiftCalendar  from '@/components/shift_components/shift_calander';
export default function ShiftPage(){
  return (
    <div className="p-5 justify-center flex gap-5 m-5">
      <div>
        <button
        className="bg-green-400 rounded-xl p-4 text-black"
        >
          Create shift 
          </button>
          <button
          className="bg-green-400 rounded-xl p-4"
          > add new subject
          </button>
      </div>
    </div>
  )
}