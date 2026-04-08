"use client";


import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("Login Please!");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUsername("Please login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (error || !data) {
        setUsername("User not found");
        console.log(error)
        return;
      }

      setUsername(data.username);
      console.log(user.email)
    }

    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <main className="p-6 pt-20">
        <h1 className="text-2xl font-bold">
          Welcome, {username} 👋
        </h1>
      </main>
    </div>
  );
}