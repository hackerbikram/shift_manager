"use client";

import SubjectCreateForm from "@/components/shift_components/subject_create_form";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import type { Subject } from "@/types/subject";
import { Button } from "@/components/ui/button";

export default function Subjectpage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [user_id, setUser_id] = useState<string | null>(null);
  const [message, setMesssage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [pageMode, setPageMode] = useState<"addSubject" | "viewShift">("viewShift");

  // ✅ EDIT STATE
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // 🔐 Load user
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setMesssage("⚠️ Please login first");
      } else {
        setUser_id(data.user.id);
      }
    };

    loadUser();
  }, []);

  // 📦 Load subjects
  const loadSubjects = async () => {
    if (!user_id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", user_id)
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
    } else if (data) {
      setSubjects(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSubjects();
  }, [user_id]);

  // 🗑 DELETE
  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // ✏️ START EDIT
  const startEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setPageMode("addSubject"); // switch to form view
  };

  return (
    <div className="max-w-4xl mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4 text-center">
        📚 Subject Manager
      </h1>

      {message && (
        <p className="text-red-500 text-center mb-3">{message}</p>
      )}

      <div className="flex justify-center gap-3 mb-6">
        <Button
          variant={pageMode === "viewShift" ? "default" : "ghost"}
          onClick={() => {
            setPageMode("viewShift");
            setEditingSubject(null);
          }}
        >
          View Subjects
        </Button>

        <Button
          variant={pageMode === "addSubject" ? "default" : "ghost"}
          onClick={() => {
            setPageMode("addSubject");
            setEditingSubject(null);
          }}
        >
          Add Subject
        </Button>
      </div>

      {/* ➕ CREATE / ✏️ EDIT FORM */}
      {pageMode === "addSubject" && (
        <div className="p-4 border rounded-xl shadow-md bg-white">
          <SubjectCreateForm
            mode={editingSubject ? "edit" : "create"}
            initialData={editingSubject}
            onCreated={() => {
              loadSubjects();
              setPageMode("viewShift");
            }}
            onUpdated={() => {
              loadSubjects();
              setEditingSubject(null);
              setPageMode("viewShift");
            }}
          />
        </div>
      )}

      {/* 📦 SUBJECT LIST */}
      {pageMode === "viewShift" && (
        <div>
          {loading ? (
            <p className="text-center text-gray-500">Loading subjects...</p>
          ) : subjects.length === 0 ? (
            <p className="text-center text-gray-400">
              No subjects found. Add one 🚀
            </p>
          ) : (
            <div className="grid gap-4">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl shadow-md border hover:shadow-lg transition-all"
                  style={{
                    borderLeft: `6px solid ${s.color || "#6366f1"}`,
                  }}
                >
                  <h2 className="text-lg font-semibold">{s.name}</h2>

                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    <p className="text-white">👨‍🏫 {s.teacher}</p>
                    <p className="text-white">🏫 {s.room}</p>
                    <p className="text-white">⏱ {s.duration_minutes} min</p>
                  </div>

                  {/* ⚡ ACTION BUTTONS */}
                  <div className="flex gap-2 mt-3 text-black">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(s)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}