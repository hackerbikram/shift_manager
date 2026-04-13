import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AppSideBar from "@/components/app-sidebar";
import MobileSidebar from "@/components/mobile-sidebar";
import ProfileMenu from "@/components/profile-menu"
import { SidebarProvider } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shift Manager",
  description: "Manage your shift and income money salary in simple way.",
  manifest: "/manifest.json",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* ✅ FIXED (new standard) */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Shift Manager" />
      </head>

      <body className="min-h-screen flex bg-black text-white">
        <SidebarProvider>

        {/* 💻 Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSideBar />
        </div>

        {/* 📱 Main Area */}
        <div className="flex-1 flex flex-col">

          {/* 🔝 Mobile Top Bar */}
          <div className="md:hidden flex items-center justify-between p-3 border-b border-white/10">

  {/* LEFT: hamburger */}
  <div className="flex items-center gap-2">
    <MobileSidebar />
    <span className="font-semibold">Shift Manager</span>
  </div>
</div>
<div className="flex items-center  justify-end p-3 border-b border-white/10">
  <ProfileMenu  />
</div>

          {/* 📄 Page Content */}
          <main className="flex-1 p-4">
            {children}
          </main>

        </div>
        </SidebarProvider>

      </body>
    </html>
  );
}