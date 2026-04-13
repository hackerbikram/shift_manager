import { Home, Briefcase, Clock, History, Settings,LayoutDashboard,Clock3,BookAIcon, icons} from "lucide-react"

export const menu = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    {name: "Shift", icon:  Clock3,href: "/shift"},
    { name: "Jobs", icon: Briefcase, href: "/job" },
    {name: "Subject", icon: BookAIcon, href: "/subject"},
    { name: "Work Entry", icon: Clock3, href: "/shift_entry" },
    { name: "Settings", icon: Settings, href: "/setting" },
];
