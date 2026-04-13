'use client'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfileMenu() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState<string>("")

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      setUser(u)

      if (u) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", u.id)
          .single()

        if (profile) {
          setUsername(profile.username)
        }
      }
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const initial =
    username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U"

  return (
    <DropdownMenu>
      {/* 👤 Avatar */}
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <Avatar className="h-9 w-9 border border-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition">
            <AvatarFallback className="bg-white/10 text-white">
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      {/* 📦 Dropdown */}
      <DropdownMenuContent
        align="end"
        className="bg-black/90 backdrop-blur-xl border border-white/10 text-white w-56"
      >

        {/* 🔥 Profile Info */}
        {user && (
          <div className="px-3 py-2 border-b border-white/10">
            <div className="font-semibold text-sm">
              {username || "No Name"}
            </div>
            <div className="text-xs opacity-70 truncate">
              {user.email}
            </div>
          </div>
        )}

        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="cursor-pointer hover:bg-white/10"
        >
          Settings
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-400 hover:bg-red-500/20"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}