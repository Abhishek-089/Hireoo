"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  SlidersHorizontal,
} from "lucide-react"
import posthog from "posthog-js"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  setSidebarOpen: (open: boolean) => void
}

export function DashboardHeader({ user, setSidebarOpen }: DashboardHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.charAt(0).toUpperCase() ?? "U"

  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <header className="h-14 flex items-center justify-between px-4 sm:px-6">

        {/* Left: mobile menu toggle */}
        <button
          className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Right: actions + user */}
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/onboarding" onClick={() => posthog.capture("start_job_search_clicked")}>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm shadow-indigo-200">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Start Job Search</span>
            </button>
          </Link>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200/60 shrink-0">
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-indigo-600">{initials}</span>
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user.name || "User"}
              </span>
              <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-gray-400" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200/60 shrink-0">
                        {user.image ? (
                          <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-indigo-600">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1 px-1.5">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        posthog.capture("user_signed_out")
                        setUserMenuOpen(false)
                        signOut({ callbackUrl: "/" })
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  )
}
