"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Briefcase, MapPin, Pencil, ArrowRight, Loader2 } from "lucide-react"
import { EditPreferencesModal, type PreferencesData } from "./EditPreferencesModal"


interface ProfileSummaryBannerProps {
  data: PreferencesData
}

export function ProfileSummaryBanner({ data }: ProfileSummaryBannerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleStartSearch = async () => {
    setSearching(true)
    try {
      await fetch("/api/scraping/match-posts", { method: "POST" })
    } catch {
      // proceed to matches page even on error
    } finally {
      setSearching(false)
      router.push("/dashboard/job-matches")
    }
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white px-6 py-5">
        {/* Subtle dot grid */}
        <div
          className="absolute right-0 top-0 w-72 h-full opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: profile summary */}
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-100">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="space-y-2 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Your active job search</p>

              {/* Target roles */}
              {data.preferred_job_titles.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {data.preferred_job_titles.slice(0, 3).map((title) => (
                      <span key={title} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        {title}
                      </span>
                    ))}
                    {data.preferred_job_titles.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        +{data.preferred_job_titles.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Skills */}
              {data.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.slice(0, 5).map((skill) => (
                    <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-600">
                      {skill}
                    </span>
                  ))}
                  {data.skills.length > 5 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-400">
                      +{data.skills.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* Location */}
              {(data.preferred_locations.length > 0 || data.remote_work_preferred) && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>
                    {[
                      ...data.preferred_locations.slice(0, 2),
                      data.remote_work_preferred ? "Remote" : null,
                    ].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: CTAs */}
          <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-end lg:flex-row">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 text-indigo-600 text-xs font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Preferences
            </button>
            <button
              onClick={handleStartSearch}
              disabled={searching}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
            >
              {searching ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…</>
              ) : (
                <>Start Search <ArrowRight className="h-3.5 w-3.5" /></>
              )}
            </button>
          </div>
        </div>
      </div>

      <EditPreferencesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={data}
      />
    </>
  )
}
