"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"

export default function Signup() {
const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const signUp = async () => {
    if (!email || !username || !password) {
      setMessage("Please fill all fields");
      setIsError(true);
      return;
    }

    if (password.length < 6) {
  setMessage("Password must be at least 6 characters");
  setIsError(true);
  return;
}

if (password !== confirmPassword) {
  setMessage("Passwords do not match");
  setIsError(true);
  return;
}

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setIsError(true);
      setLoading(false);
      return;
    }

    if (data.user) {
  const { error: profileError, data: profileData } = await supabase
    .from("profiles")
    .insert([
      {
        id: data.user.id,
        username: username,
      },
    ]);

  console.log("profile insert:", profileData);
  console.log("profile error:", profileError);

  if (profileError) {
    setMessage(profileError.message);
    setIsError(true);
    setLoading(false);
    return;
  }
}

    setMessage("Account created successfully 🌸");
    setIsError(false);
    setLoading(false);
    router.push('/login')
    

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
          Create your account 🌸
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
            type="text"
            placeholder="Username"
            className="w-full p-4 rounded-2xl bg-white/50 border border-black/20 outline-none focus:ring-2 focus:ring-black/20"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />

         {/* Password */}
<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    className="w-full p-4 rounded-2xl bg-white/50 border border-black/20 outline-none focus:ring-2 focus:ring-black/20 pr-12"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-70"
  >
    {showPassword ? "🙈" : "👁️"}
  </button>
</div>

{/* Confirm Password */}
<div className="relative">
  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm Password"
    className="w-full p-4 rounded-2xl bg-white/50 border border-black/20 outline-none focus:ring-2 focus:ring-black/20 pr-12"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && signUp()}
  />

  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-70"
  >
    {showConfirmPassword ? "🙈" : "👁️"}
  </button>
</div>

          <button
            onClick={signUp}
            disabled={loading}
            className="w-full p-4 rounded-2xl bg-black text-white hover:bg-slate-800 transition-all"
          >
            {loading ? "Creating..." : "Sign Up"}
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
          {confirmPassword && (
  <p className={`text-xs mt-1 ${
    password === confirmPassword ? "text-green-600" : "text-red-500"
  }`}>
    {password === confirmPassword ? "Passwords match ✔" : "Passwords do not match"}
  </p>
)}
        </div>
      </div>
    </div>
  );
}