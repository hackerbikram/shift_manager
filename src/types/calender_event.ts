type CalendarEvent = {
  id: number;
  type: "school" | "break" | "job" | "custom";
  title: string;
  start: Date;
  end: Date;
  notes?: string;
  salary?: number; // only for jobs
};