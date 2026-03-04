"use client"

import Link from "next/link"
import { Mail, UserCog, CheckCircle2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExtensionInstallButton } from "@/components/extension/ExtensionInstallButton"
import { EXTENSION_CONFIG } from "@/config/extension"

interface QuickActionsProps {
  status: {
    gmail_connected: boolean
    extension_installed: boolean
    linkedin_connected: boolean
    resume_uploaded: boolean
  } | null
}

const steps = [
  {
    id: "gmail",
    title: "Connect Gmail",
    description: "Send applications directly from your inbox",
    icon: Mail,
    href: "/dashboard/email-settings",
    completedKey: "gmail_connected" as const,
    isExtension: false,
  },
  {
    id: "profile",
    title: "Complete Profile",
    description: "Add your resume and job preferences",
    icon: UserCog,
    href: "/onboarding",
    completedKey: "resume_uploaded" as const,
    isExtension: false,
  },
]

export function QuickActions({ status }: QuickActionsProps) {
  const completedCount = steps.filter((s) => status?.[s.completedKey]).length
  const totalSteps = steps.length
  const allDone = completedCount === totalSteps

  if (allDone) return null

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-indigo-100/60">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Get started</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {completedCount} of {totalSteps} steps complete
          </p>
        </div>
        {/* Step counter pill */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-6 rounded-full transition-all",
                i < completedCount ? "bg-indigo-500" : "bg-indigo-100"
              )}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-indigo-100/60">
        {steps.map((step) => {
          const done = status?.[step.completedKey] ?? false

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-4 px-5 py-4",
                done && "opacity-60"
              )}
            >
              {/* Status circle */}
              <div className={cn(
                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                done
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-white border-indigo-200"
              )}>
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : (
                  <step.icon className="h-4 w-4 text-indigo-400" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-semibold",
                  done ? "line-through text-gray-400" : "text-gray-900"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 truncate">{step.description}</p>
              </div>

              {/* Action */}
              {!done && (
                step.isExtension ? (
                  <ExtensionInstallButton
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs h-8 px-3"
                  />
                ) : (
                  <Link
                    href={step.href}
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Set up
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
