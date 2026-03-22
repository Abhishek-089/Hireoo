"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { ArrowRight, Mail, Briefcase, Zap } from "lucide-react"

export type HeroJobItem = {
  role: string
  company: string
  location: string
  tag: string
  email: string
  time: string
}

const JOB_MATCHES_PATH = "/dashboard/job-matches"
const SIGNUP_PATH = "/signup"

export function HeroJobPreview({ jobs }: { jobs: HeroJobItem[] }) {
  const { status } = useSession()
  const isAuthed = status === "authenticated"

  const ctaHref = isAuthed
    ? JOB_MATCHES_PATH
    : `${SIGNUP_PATH}?next=${encodeURIComponent(JOB_MATCHES_PATH)}`

  return (
    <div className="mt-12 relative max-w-4xl mx-auto">
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-indigo-300/20 blur-2xl rounded-full" />
      <div className="relative bg-white rounded-2xl border border-gray-200/80 shadow-2xl shadow-indigo-900/8 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div className="w-3 h-3 rounded-full bg-amber-400/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
          <div className="ml-3 flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 font-mono border border-gray-200">
            app.hireoo.in/dashboard/job-matches
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <div className="text-gray-900 font-semibold text-sm">Today&apos;s Job Matches</div>
              <div className="text-gray-400 text-xs mt-0.5">42 fresh opportunities found for you</div>
            </div>
            <Link
              href={ctaHref}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-500 text-white text-xs font-semibold shadow-sm hover:bg-indigo-600 transition-colors cursor-pointer shrink-0"
            >
              <Zap className="h-3.5 w-3.5" />
              Apply to all
              <ArrowRight className="h-3 w-3 opacity-80" />
            </Link>
          </div>
          <div className="space-y-2">
            {jobs.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-900 text-xs font-semibold truncate leading-tight">{item.role}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-gray-500 text-[11px] font-medium">{item.company}</span>
                      <span className="text-gray-300 text-[11px]">·</span>
                      <span className="text-gray-400 text-[11px]">{item.location}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-400 text-[9px] font-semibold leading-none">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="hidden sm:flex items-center gap-1 text-gray-400 text-[11px]">
                    <Mail className="h-2.5 w-2.5" />
                    {item.email}
                  </span>
                  <span className="hidden sm:block text-gray-300 text-[11px]">{item.time}</span>
                  <Link
                    href={ctaHref}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-500 text-white text-[10px] font-bold sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-indigo-600 cursor-pointer"
                  >
                    Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-xs text-gray-400 py-1">
            + 38 more matches —{" "}
            <Link
              href={ctaHref}
              className="text-indigo-500 font-medium hover:text-indigo-600 underline-offset-2 hover:underline"
            >
              view all
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
