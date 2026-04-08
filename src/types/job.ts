export type JobType = {
    id?:number;
    user_id :string;
    job_name:string;
    hourly_rate:number;
    created_at?:string;
    pay_period_start?:string;
    pay_period_end?:string;
};