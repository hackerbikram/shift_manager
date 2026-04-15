'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Profile() {
  const [username, setUsername] = useState("Loading...");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    const finalName =
      data?.username || generateFancyUsername(user.email || "user");

    setUsername(finalName);
    setNewUsername(finalName);
  };

  // ✅ Update Username
  const updateUsername = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username: newUsername,
      });

    setLoading(false);

    if (error) {
      alert("Error updating username");
      console.log(error);
    } else {
      setUsername(newUsername);
      setEditing(false);
    }
  };

  // ✅ Change Password
  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("Min 6 characters password");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      alert("Error updating password");
    } else {
      alert("Password updated 🔐");
      setNewPassword("");
    }
  };

  // ✅ Reset Email
  const resetPassword = async () => {
    if (!email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      alert("Error sending reset email");
    } else {
      alert("Reset email sent 📧");
    }
  };

  return (
    <div className="w-full flex justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-white/10 p-6 shadow-2xl backdrop-blur-xl">

        <div className="flex flex-col items-center gap-4">

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-2xl font-bold text-white animate-pulse">
            {username.charAt(0).toUpperCase()}
          </div>

          {/* Username */}
          <div className="text-center w-full">
            {editing ? (
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full text-center bg-white/10 p-2 rounded-xl text-white"
              />
            ) : (
              <h2 className="text-xl font-bold text-white">{username}</h2>
            )}

            <p className="text-sm text-zinc-400">{email}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 flex-wrap justify-center">

            {editing ? (
              <>
                <button
                  onClick={updateUsername}
                  disabled={loading}
                  className="bg-green-500 px-3 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-500 px-3 py-1 rounded"
              >
                Edit Name
              </button>
            )}

          </div>

          {/* Password Section */}
          <div className="w-full mt-4 p-4 rounded-2xl bg-white/5 space-y-3">

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 rounded bg-black/50"
            />

            <button
              onClick={changePassword}
              disabled={loading}
              className="w-full bg-emerald-500 py-2 rounded"
            >
              Change Password
            </button>

            <button
              onClick={resetPassword}
              className="w-full bg-red-500 py-2 rounded"
            >
              Send Reset Email
            </button>

          </div>

          {/* Welcome */}
          <div className="w-full mt-2 p-4 rounded-2xl bg-white/5">
            <p className="text-sm text-zinc-300 text-center">
              Welcome back {username} ✨
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}