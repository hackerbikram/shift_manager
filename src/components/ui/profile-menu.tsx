'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ProfileMenu() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

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

  // Get first letter for avatar
  const initial = user?.email?.charAt(0).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {user ? (
          <>
            <DropdownMenuItem disabled>
              {user.email}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              Dashboard
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => router.push("/login")}>
              Login
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/signup")}>
              Sign Up
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}