"use client"

import { useState, useEffect, ReactNode } from "react"
import { Search, Sparkles } from "lucide-react"

const SEARCH_PHASES = [
  "Scanning our job database...",
  "Matching your skills & experience...",
  "Analyzing job relevance...",
  "Ranking the best opportunities...",
  "Preparing your results...",
]

export function JobMatchesLoader({
  children,
  keyword,
}: {
  children: ReactNode
  keyword: string
}) {
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    let mounted = true

    const phaseTimer = setInterval(() => {
      if (mounted) setPhase((p) => Math.min(p + 1, SEARCH_PHASES.length - 1))
    }, 700)

    const timer = setTimeout(() => {
      if (mounted) {
        clearInterval(phaseTimer)
        setLoading(false)
      }
    }, 3500)

    return () => {
      mounted = false
      clearInterval(phaseTimer)
      clearTimeout(timer)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md mx-auto animate-in fade-in duration-500">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-30" />
            <div className="absolute inset-2 rounded-full bg-blue-50 animate-pulse" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30">
              <Search className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Finding Your Perfect Jobs
            </h2>
            <div className="h-6">
              <p
                key={phase}
                className="text-gray-500 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {SEARCH_PHASES[phase]}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {SEARCH_PHASES.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i <= phase ? "w-8 bg-blue-500" : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {keyword && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span>
                Searching for <span className="font-medium text-gray-600">"{keyword}"</span>
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {children}
    </div>
  )
}
