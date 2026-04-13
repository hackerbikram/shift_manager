'use client'

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { LogInIcon, LogOutIcon } from "lucide-react"
import { Button } from "../ui/button"

export default function AuthButton() {
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

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleClick = async () => {
    if (user) {
      await supabase.auth.signOut()
      router.push("/login")
    } else {
      router.push("/login")
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="flex items-center gap-2"
    >
      {user ? (
        <>
          <LogOutIcon size={18} />
          Logout
        </>
      ) : (
        <>
          <LogInIcon size={18} />
          Login
        </>
      )}
    </Button>
  )
}