'use client'

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthButton from "./auth/auth_button"
import { SheetHeader } from "@/components/ui/sheet"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { menu } from "./menu"

export default function MobileSideBar() {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-64 bg-black text-white border-r border-white/10"
      > 
      <SheetHeader>
    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
  </SheetHeader>
        <div className="p-4 text-lg font-bold">
          Shift Manager ⚡
        </div>
        <div className="flex justify-start p-4">
                  <AuthButton />
                </div>

        <div className="flex flex-col gap-1 px-2">
          {menu.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition
                  ${active
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "hover:bg-white/10 text-white/80"}
                `}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}