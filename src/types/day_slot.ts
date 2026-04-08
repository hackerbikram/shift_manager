export type DaySlot = {
  time: string;               // "09:00"
  event_type: "class" | "break" | "job" | "custom";
  title: string;
  subject_name?: string;
  job_name?: string;
  duration_minutes: number;
  break_after?: number;
};