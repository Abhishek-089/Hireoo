"use client"

import { useState } from "react"
import { DashboardSidebar } from "./DashboardSidebar"
import { DashboardHeader } from "./DashboardHeader"

interface DashboardShellProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  hasProfile?: boolean
}

export function DashboardShell({ children, user, hasProfile }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50/80 overflow-hidden">
      <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader user={user} setSidebarOpen={setSidebarOpen} hasProfile={hasProfile} />
        
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
