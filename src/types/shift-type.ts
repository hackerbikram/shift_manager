type ShiftSourceType = "subject" | "job" | "event" | "break" | "holiday";

export type UniversalShift = {
  id: string;

  type: ShiftSourceType;
  source_id?: number;

  title: string;

  start: string; // "HH:mm"
  end: string;   // "HH:mm"

  color: string;

  meta?: {
    teacher?: string;
    room?: string;
    salary?: number;
    location?: string;
  };
};

type Dayshift = UniversalShift[];

export type WeeklyTemplate = {
  monday: Dayshift;
  tuesday: Dayshift;
  wednesday: Dayshift;
  thursday: Dayshift;
  friday: Dayshift;
  saturday: Dayshift;
  sunday: Dayshift;
};

type DateOverride = {
  date: string; // "YYYY-MM-DD"
  shifts: Dayshift;
};

export const emptySchedule: WeeklyTemplate = {
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
};