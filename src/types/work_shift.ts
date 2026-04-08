export type Work_shift = {
    id:string | null;
    user_id:string;
    work_date:string;
    start_time:string;
    end_time:string;

    break_minutes:number;
    worked_minutes:number;
    daily_salary:number;
    note:string | null ;
    created_at:string | null
}