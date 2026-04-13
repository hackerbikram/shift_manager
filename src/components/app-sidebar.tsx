'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader
} from "@/components/ui/sidebar"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { menu } from "./menu"

import AuthButton from "./auth/auth_button"


export default function AppSideBar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-white/10 bg-black/80 backdrop-blur-xl">

      {/* 🔥 Header */}
      <SidebarHeader>
        <div className="px-4 py-4 text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
          Shift Manager
        </div>
      </SidebarHeader>

      {/* 🔥 Content */}
      <SidebarContent>
        <SidebarGroup>
          <div className="flex justify-start p-4">
            <AuthButton />
          </div>

          <div className="flex flex-col gap-1 px-2">

            {menu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${active 
                      ? "bg-emerald-500/20 black font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                      : "hover:bg-white/10 text-red/80 hover:text-red"}
                  `}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}

          </div>

        </SidebarGroup>
      </SidebarContent>

      {/* 🔥 Footer */}
      <SidebarFooter>
        <div className="px-4 py-3 text-xs text-white/50">
          © 2026 Techura
        </div>
      </SidebarFooter>

    </Sidebar>
  )
}