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
  Star,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import posthog from "posthog-js"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Matched Jobs", href: "/dashboard/job-matches", icon: Briefcase },
  { name: "My Applications", href: "/dashboard/email-activity", icon: Mail },
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
        "dashboard-sidebar fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center cursor-pointer">
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
                onClick={() => {
                  setSidebarOpen(false)
                  if (!isActive) posthog.capture("dashboard_nav_clicked", { section: item.name })
                }}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer",
                  "transition-all duration-200 ease-out",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 hover:translate-x-0.5"
                )}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-all duration-200",
                  isActive
                    ? "text-indigo-600 scale-105"
                    : "text-gray-400 group-hover:text-gray-600"
                )} />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-3">
          {/* Upgrade CTA */}
          <Link
            href="/dashboard/billing"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200 cursor-pointer"
          >
            <Star className="h-4 w-4" />
            Upgrade Now
          </Link>

          {/* Help / FAQ */}
          <Link
            href="/faq"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 active:scale-95 transition-all cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
            Help - FAQ
          </Link>

          <p className="text-[10px] text-gray-300 text-center">
            © {new Date().getFullYear()} Hireoo · Built in India 🇮🇳
          </p>
        </div>
      </div>
    </>
  )
}
