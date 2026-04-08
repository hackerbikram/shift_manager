"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState<"login" | "signup" | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const login = async () => {
    if (!email || !password) {
      setMessage("Please enter email and password");
      setIsError(true);
      return;
    }

    setLoading("login");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsError(true);
    } else {
      setMessage("Login successful ✨");
      setIsError(false);

      setTimeout(() => {
        router.push("/");
      }, 1200);
    }

    setLoading(null);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 text-black">

      <div className="absolute w-56 h-56 rounded-full bg-white/40 blur-3xl top-10 left-5 animate-pulse"></div>
      <div className="absolute w-72 h-72 rounded-full bg-white/30 blur-3xl bottom-10 right-5 animate-pulse"></div>

      <div className="w-full max-w-sm rounded-3xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl p-6 z-10">

        <h1 className="text-2xl font-bold text-center mb-2">
          Shift Manager
        </h1>

        <p className="text-center text-sm text-gray-600 mb-6">
          Manage work beautifully 🌸
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-2xl bg-white/50 border border-black/20 outline-none focus:ring-2 focus:ring-black/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-2xl bg-white/50 border border-black/20 outline-none focus:ring-2 focus:ring-black/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />

          <button
            onClick={login}
            disabled={loading !== null}
            className="w-full p-4 rounded-2xl bg-black text-white hover:bg-slate-800 transition-all"
          >
            {loading === "login" ? "Loading..." : "Login"}
          </button>

          <button
            onClick={()=>{router.push("/singup")}}
            disabled={loading !== null}
            className="w-full p-4 rounded-2xl bg-white border border-black/20 hover:bg-slate-100 transition-all"
          >
            {loading === "signup" ? "Creating..." : "Create Account"}
          </button>

          {message && (
            <div
              className={`text-center text-sm mt-4 ${
                isError ? "text-red-500" : "text-green-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}