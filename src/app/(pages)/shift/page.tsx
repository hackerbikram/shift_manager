'use client'
import { Button } from '@/components/ui/button';
import {Plus ,Clock} from "lucide-react"
import { useState } from "react";
import SubjectCreateForm from "@/components/shift_components/subject_create_form";
import CreateShift from '@/components/shift_components/create-shift';

type activePage = "createShift" | "addSubject" | "updateShift"
export default function ShiftPage(){
  const [activePage,setActivePage] = useState<activePage | null>(null);
  return (
    <div className="p-5 justify-center flex gap-5 m-5">
      <CreateShift />
    </div>
  )
}