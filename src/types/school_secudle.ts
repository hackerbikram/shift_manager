import type { Subject } from "./subject";


export type WeekdaySchedule = Subject[];


export type SchoolSchedule = {
  id: number;
  user_id: string;            // FK -> UserProfile.id
  suject_name:string;
  start_time: string;         // "09:00"
  end_time: string;           // "09:50"
  break_after_minutes: number; // 10
  days_of_week:string;
  active:boolean;
};

export type SchoolWeekdays = {
  monday: WeekdaySchedule;
  tuesday: WeekdaySchedule;
  wednesday: WeekdaySchedule;
  thursday: WeekdaySchedule;
  friday: WeekdaySchedule;
  saturday: WeekdaySchedule;
  sunday: WeekdaySchedule;
};

export type SchoolTemplate = {
  id?: number;
  user_id: string;
  semester: string;
  name: string;
  schedule_json: SchoolWeekdays;
  created_at?: string;
  updated_at?: string;
};