"use client"

import { useState } from "react"
import { Check, Chrome, Shield, ExternalLink, Loader2, Sparkles, Rocket, Zap } from "lucide-react"
import { useExtensionDetection } from "@/hooks/useExtensionDetection"
import { EXTENSION_CONFIG } from "@/config/extension"

interface SettingsStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export function SettingsStep({ data, onNext, onBack }: SettingsStepProps) {
  const { isInstalled, isChecking } = useExtensionDetection()
  const [isStarting, setIsStarting] = useState(false)

  const handleStartSearching = async () => {
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
    <div className="space-y-8 max-w-2xl mx-auto">

      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
          <Rocket className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">You're all set!</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          We'll search our database for job posts that match your profile and apply on your behalf.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Smart matching */}
        <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Smart Job Matching</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Our AI scans thousands of job posts and scores them against your skills, title, and preferences.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600">
            <Check className="h-3.5 w-3.5" /> Active
          </div>
        </div>

        {/* Extension (optional) */}
        <div className="p-5 rounded-2xl border border-amber-100 bg-amber-50/50 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Chrome className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Browser Extension</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Optional — get real-time results from LinkedIn directly.
            </p>
          </div>
          {isChecking ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking…
            </div>
          ) : isInstalled ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <Check className="h-3.5 w-3.5" /> Installed &amp; ready
            </div>
          ) : (
            <button
              onClick={() => window.open(EXTENSION_CONFIG.storeUrl, "_blank", "noopener,noreferrer")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Install extension
            </button>
          )}
        </div>

      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={handleStartSearching}
          disabled={isStarting}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-200 group"
        >
          {isStarting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Start Searching Jobs
            </>
          )}
        </button>
        <p className="text-xs text-gray-400">
          We'll match you with the best-fit posts from our database automatically.
        </p>
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-700 font-medium transition cursor-pointer"
        >
          Go back
        </button>
      </div>

    </div>
  )
}
