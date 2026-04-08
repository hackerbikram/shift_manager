"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Subject } from "@/types/subject";
import type { SchoolWeekdays, WeekdaySchedule } from "@/types/school_secudle";

type ShiftItem = {
  day: string;
  subjectName: string;
  start: string;
  end: string;
  color: string;
  isCurrent: boolean;
};

const weekIndexToName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

type ViewMode = "month" | "week" | "day";

export default function ShiftListView() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scheduleJson, setScheduleJson] = useState<SchoolWeekdays | null>(null);
  const [shiftList, setShiftList] = useState<ShiftItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? "";
  };

  const loadSubjects = async () => {
    const { data } = await supabase.from("subjects").select("*").order("id");
    if (!data) return;
    const breakSubject: Subject = { id: -1, user_id:"", name:"Break", teacher:"", room:"", color:"#F59E0B", duration_minutes:10 };
    setSubjects([...data, breakSubject]);
  };

  const loadSchedule = async () => {
    const user_id = await getUserId();
    if (!user_id) return;
    const { data, error } = await supabase.from("school_templates").select("schedule_json").eq("user_id", user_id).maybeSingle();
    if (error) return;
    if (data?.schedule_json) setScheduleJson(data.schedule_json);
  };

  const getDateOfWeekday = (weekdayIndex:number, baseDate:Date=new Date()) => {
    const diff = weekdayIndex - baseDate.getDay();
    const target = new Date(baseDate);
    target.setDate(baseDate.getDate() + diff);
    return target;
  };

  const generateShiftList = () => {
    if(!scheduleJson) return;
    const list: ShiftItem[] = [];

    for(let i=0;i<7;i++){
      const dayName = weekIndexToName[i].toLowerCase() as keyof SchoolWeekdays;
      const daySchedule: WeekdaySchedule = scheduleJson[dayName];
      if(!daySchedule) continue;

      if((daySchedule as any).dayType === "holiday"){
        list.push({
          day: weekIndexToName[i],
          subjectName: "Holiday",
          start: "",
          end: "",
          color: "#f87171",
          isCurrent: false
        });
      } else {
        (daySchedule as any).blocks?.forEach((block:any)=>{
          const subject = subjects.find(s=>s.id===block.subjectId);

          const startTime = new Date(getDateOfWeekday(i));
          const [startH, startM] = block.start.split(":").map(Number);
          startTime.setHours(startH,startM,0,0);

          const endTime = new Date(getDateOfWeekday(i));
          const [endH, endM] = block.end.split(":").map(Number);
          endTime.setHours(endH,endM,0,0);

          const now = currentTime;
          const isCurrent = now >= startTime && now <= endTime;

          list.push({
            day: weekIndexToName[i],
            subjectName: subject?.name || "Break",
            start: block.start,
            end: block.end,
            color: subject?.color || "#10b981",
            isCurrent
          });
        });
      }
    }

    list.sort((a,b)=>{
      const dayA = weekIndexToName.indexOf(a.day);
      const dayB = weekIndexToName.indexOf(b.day);
      if(dayA!==dayB) return dayA-dayB;
      return a.start.localeCompare(b.start);
    });

    // Filter by viewMode
    const filtered = list.filter(s=>{
      const shiftDate = getDateOfWeekday(weekIndexToName.indexOf(s.day));
      if(viewMode==="day") {
        return shiftDate.toDateString() === selectedDate.toDateString();
      }
      if(viewMode==="week") {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate()+6);
        return shiftDate >= startOfWeek && shiftDate <= endOfWeek;
      }
      return true; // month
    });

    setShiftList(filtered);
  };

  useEffect(()=>{
    const timer = setInterval(()=>setCurrentTime(new Date()),1000);
    return ()=>clearInterval(timer);
  },[]);

  useEffect(()=>{
    loadSubjects();
    loadSchedule();
  },[]);

  useEffect(()=>{
    if(scheduleJson && subjects.length) generateShiftList();
  },[scheduleJson, subjects, currentTime, viewMode, selectedDate]);

  return (
    <div className="w-full md:max-w-5xl mx-auto p-4 bg-white shadow-2xl rounded-3xl border border-gray-300">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Shifts Timeline</h2>

      {/* View Selector */}
      <div className="flex justify-center gap-2 mb-4">
        {(["month","week","day"] as ViewMode[]).map(mode=>(
          <button key={mode} onClick={()=>setViewMode(mode)}
            className={`px-3 py-1 rounded-md font-semibold
              ${viewMode===mode ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            {mode.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Shift List */}
      <div className="space-y-2">
        {shiftList.map((shift, idx)=>(
          <div
            key={idx}
            className={`p-3 rounded-xl flex justify-between items-center transition-all duration-300
              ${shift.isCurrent ? "bg-yellow-100 shadow-lg scale-105 animate-pulse" : "bg-white/80 hover:bg-gray-100"} 
              border-l-4`}
            style={{borderColor: shift.color}}
          >
            <div>
              <div className="font-semibold text-sm md:text-base">{shift.subjectName}</div>
              {shift.start && shift.end && (
                <div className="text-xs md:text-sm text-gray-600">{shift.start} - {shift.end}</div>
              )}
            </div>
            <div className="text-xs md:text-sm text-gray-500">{shift.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
}