"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  Mail,
  Settings,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Matched Jobs", href: "/dashboard/job-matches", icon: Briefcase },
  { name: "Recruiter Replies", href: "/dashboard/email-activity", icon: Mail },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function DashboardSidebar({ sidebarOpen, setSidebarOpen }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/Hireo-logo.png"
              alt="Hireoo"
              width={540}
              height={247}
              className="h-8 w-auto"
            />
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Menu
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                )} />
                {item.name}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 text-center">
            © {new Date().getFullYear()} Hireoo · Built in India 🇮🇳
          </p>
        </div>
      </div>
    </>
  )
}
