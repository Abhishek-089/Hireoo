"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  Menu,
  ChevronDown,
  LogOut,
  User,
  History,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DailyLimitProgress } from "./DailyLimitProgress"

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

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            className="lg:hidden p-2 -ml-2 mr-2 rounded-md text-gray-400 hover:text-gray-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

        </div>

        <div className="flex items-center gap-4">
          {/* Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/onboarding">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-4 w-4" />
                New Loop
              </Button>
            </Link>
          </div>

          {/* User Dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex items-center p-1 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 overflow-hidden border border-gray-200">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-medium text-sm">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <span className="hidden md:block ml-2 text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user.name || "User"}
                </span>
                <ChevronDown className="hidden md:block ml-1 h-3 w-3 text-gray-400" />
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    signOut({ callbackUrl: "/" })
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Daily Limit Progress Bar */}
      {/* <div className="px-4 sm:px-6 lg:px-8 py-3 bg-gray-50">
        <DailyLimitProgress />
      </div> */}
    </div>
  )
}
