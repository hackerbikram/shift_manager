export type CustomEvent = {
  id: number;
  user_id: string;            // FK -> UserProfile.id
  title: string;
  description?: string;
  start_time: string;         // "YYYY-MM-DD HH:mm"
  end_time: string;           // "YYYY-MM-DD HH:mm"
  color?: string;             // For calendar visualization
  is_school?: boolean;        // distinguishes school vs job vs custom
};