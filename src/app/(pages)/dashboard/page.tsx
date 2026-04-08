'use client'

import MonthlyWork from "@/components/monthly_worked"
import Profile from "@/components/profile"

export default function DashBoard(){
    return (
        <div className="">
            <div className="p-4">
                <Profile />
            </div>
            <MonthlyWork />
        </div>
    )
}