'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Profile() {
  const [username, setUsername] = useState("Loading...");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUserName();
  }, []);

  const generateFancyUsername = (emailValue: string) => {
    const base = emailValue.split("@")[0] || "user";
    return `✦ ${base}_zen`;
  };

  const loadUserName = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUsername("Please Login...");
      return;
    }

    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error.message);
      setUsername(generateFancyUsername(user.email || "user"));
      return;
    }

    if (data?.username) {
      setUsername(data.username);
    } else {
      setUsername(generateFancyUsername(user.email || "user"));
    }
  };

  return (
    <div className="w-full flex justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-white/10 p-6 shadow-2xl backdrop-blur-xl">

        <div className="flex flex-col items-center gap-4">

          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-2xl font-bold text-white">
            {username.charAt(0).toUpperCase()}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{username}</h2>
            <p className="text-sm text-zinc-400">{email}</p>
          </div>

          <div className="w-full mt-4 p-4 rounded-2xl bg-white/5">
            <p className="text-sm text-zinc-300 text-center">
              Welcome back {username}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}