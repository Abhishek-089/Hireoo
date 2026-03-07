"use client"

import { useState } from "react"
import {
  Check, Chrome, ExternalLink, Loader2, Sparkles,
  Zap, Briefcase, FileText, Mail, Search, Pencil,
} from "lucide-react"
import { useExtensionDetection } from "@/hooks/useExtensionDetection"
import { EXTENSION_CONFIG } from "@/config/extension"

interface SettingsStepProps {
  data: any   // receives full onboardingData: { searchInfo, emailTemplate, settings }
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const JOB_TYPE_LABELS: Record<string, string> = {
  "freelance":  "Freelance",
  "full-time":  "Full Time",
  "internship": "Internship",
}

const EXP_LABELS: Record<string, string> = {
  "0-1":  "0–1 Years (Entry Level)",
  "1-3":  "1–3 Years (Junior)",
  "3-5":  "3–5 Years (Mid-Level)",
  "5-10": "5–10 Years (Senior)",
  "10+":  "10+ Years (Lead / Architect)",
}

export function SettingsStep({ data, onNext, onBack }: SettingsStepProps) {
  const { isInstalled, isChecking } = useExtensionDetection()
  const [isStarting, setIsStarting] = useState(false)

  const search   = data?.searchInfo   || {}
  const template = data?.emailTemplate || {}

  const jobType    = JOB_TYPE_LABELS[search.jobType]        || search.jobType   || "—"
  const keyword    = search.jobKeywords?.[0]                 || "—"
  const experience = EXP_LABELS[search.experienceLevel]     || search.experienceLevel || "—"
  const hasResume  = !!search.resume?.uploaded
  const emailTone  = template.templateName                   || "—"
  const subject    = template.subject                        || "—"

  const handleStart = async () => {
    setIsStarting(true)
    if (isInstalled) {
      try {
        // @ts-ignore
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          await new Promise<void>((resolve) => {
            // @ts-ignore
            chrome.runtime.sendMessage(EXTENSION_CONFIG.id, { type: "START_HIDDEN_RUNNER", source: "ONBOARDING" }, () => resolve())
            setTimeout(() => resolve(), 1000)
          })
        }
      } catch (err) {
        console.error("[Onboarding] Error triggering automation:", err)
      }
    }
    onNext({ completed: true })
  }

  return (
    <div className="space-y-5">

      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Review your setup</h3>
          <p className="text-xs text-gray-400 mt-0.5">Everything look good? Hit Start to find your jobs.</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-2 gap-3">

        {/* Job Search Preferences */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Job Preferences</p>
          <div className="space-y-2.5">
            <Row icon={<Zap className="h-3.5 w-3.5 text-indigo-500" />} label="Job Type" value={jobType} />
            <Row icon={<Search className="h-3.5 w-3.5 text-indigo-500" />} label="Keyword" value={keyword} />
            <Row icon={<Briefcase className="h-3.5 w-3.5 text-indigo-500" />} label="Experience" value={experience} />
            <Row
              icon={<FileText className="h-3.5 w-3.5 text-indigo-500" />}
              label="Resume"
              value={
                hasResume
                  ? <span className="text-emerald-600 font-semibold flex items-center gap-1"><Check className="h-3 w-3" />Uploaded</span>
                  : <span className="text-gray-400 italic">Not uploaded</span>
              }
            />
          </div>
        </div>

        {/* Email Style */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Email Style</p>
          <div className="space-y-2.5">
            <Row icon={<Mail className="h-3.5 w-3.5 text-indigo-500" />} label="Tone" value={emailTone} />
            <div className="space-y-1">
              <p className="text-[11px] text-gray-400 font-medium">Subject preview</p>
              <p className="text-xs text-gray-700 leading-relaxed bg-white border border-gray-200 rounded-lg px-3 py-2 break-words">
                {subject}
              </p>
            </div>
          </div>

          {/* Extension */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                <Chrome className="h-3.5 w-3.5" /> Chrome Extension
              </div>
              {isChecking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
              ) : isInstalled ? (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Ready
                </span>
              ) : (
                <button
                  onClick={() => window.open(EXTENSION_CONFIG.storeUrl, "_blank", "noopener,noreferrer")}
                  className="text-[11px] font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3" /> Install
                </button>
              )}
            </div>
            {!isInstalled && !isChecking && (
              <p className="text-[11px] text-gray-400 mt-1">Optional — scrapes live LinkedIn jobs directly.</p>
            )}
          </div>
        </div>

      </div>

      {/* CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition cursor-pointer shadow-sm shadow-indigo-200"
        >
          {isStarting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</>
            : <><Sparkles className="h-4 w-4" /> Start Searching Jobs</>
          }
        </button>
      </div>

    </div>
  )
}

// Small helper row component
function Row({
  icon, label, value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 leading-none">{label}</p>
        <div className="text-xs font-semibold text-gray-800 mt-0.5 truncate">{value}</div>
      </div>
    </div>
  )
}
