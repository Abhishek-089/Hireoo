'use client'

import { useEffect, useState } from 'react'
import { Zap, Clock } from 'lucide-react'
import Link from 'next/link'

interface DailyLimitData {
  current: number
  limit: number
  resetAt: string
  canScrape: boolean
  hoursUntilReset: number
  percentageUsed: number
  tier: string
}

export function DailyLimitProgress() {
  const [limitData, setLimitData] = useState<DailyLimitData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLimitData()
    const interval = setInterval(fetchLimitData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchLimitData = async () => {
    try {
      const response = await fetch('/api/scraping/daily-limit')
      if (response.ok) {
        const data = await response.json()
        setLimitData(data.data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  if (loading || !limitData) return null

  const { current, limit, percentageUsed, hoursUntilReset, tier } = limitData
  const limitReached = current >= limit
  const isFreeUser = tier === 'Free'

  const barColor = percentageUsed >= 90
    ? 'bg-red-500'
    : percentageUsed >= 70
    ? 'bg-amber-400'
    : 'bg-indigo-500'

  const labelColor = percentageUsed >= 90
    ? 'text-red-600'
    : percentageUsed >= 70
    ? 'text-amber-600'
    : 'text-indigo-600'

  return (
    <div className={`rounded-2xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
      limitReached ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100 shadow-sm'
    }`}>
      {/* Icon + label */}
      <div className="flex items-center gap-3 shrink-0">
        <div className={`p-2 rounded-xl ${limitReached ? 'bg-red-100' : 'bg-indigo-500/10'}`}>
          <Zap className={`h-4 w-4 ${limitReached ? 'text-red-500' : 'text-indigo-600'}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Daily Job Limit</p>
          <p className={`text-xs font-medium ${labelColor}`}>
            {current} / {limit} matched today
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">{percentageUsed}% used</span>
          {limitReached && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="h-3 w-3" />
              Resets in {hoursUntilReset}h
            </span>
          )}
        </div>
      </div>

    </div>
  )
}
