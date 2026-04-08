'use client';

import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, Briefcase, Clock3, History, Wallet, Settings, LogIn } from "lucide-react";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export default function MobileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { label: "Login", icon: LogIn, href: "/login" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    {label: "Shift", icon:  Clock3,href: "/shift"},
    { label: "Jobs", icon: Briefcase, href: "/job" },
    { label: "Work Entry", icon: Clock3, href: "/shift_entry" },
    { label: "Settings", icon: Settings, href: "/setting" },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-[10000] p-3 rounded-2xl bg-black/90 text-white shadow-xl backdrop-blur-md active:scale-95 transition"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={() => setOpen(false)}
      >
        {/* Drawer */}
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-0 h-full w-72 bg-zinc-950/95 backdrop-blur-xl shadow-2xl border-r border-white/10 rounded-r-3xl p-5 transform transition-transform duration-300 touch-pan-y ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-xl font-semibold">Menu</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-xl hover:bg-white/10 text-white transition"
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {menuItems.map(({ label, icon: Icon, href }) => (
              <button
                type="button"
                key={label}
                onClick={() => { router.push(href); setOpen(false); }}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl text-white hover:bg-white/10 active:scale-[0.98] transition text-left"
              >
                <Icon size={20} />
                <span className="text-base font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}