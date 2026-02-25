'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchLimitData()
        // Refresh every 30 seconds
        const interval = setInterval(fetchLimitData, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchLimitData = async () => {
        try {
            const response = await fetch('/api/scraping/daily-limit')
            if (!response.ok) {
                throw new Error('Failed to fetch daily limit')
            }
            const data = await response.json()
            setLimitData(data.data)
            setError(null)
        } catch (err) {
            console.error('Error fetching daily limit:', err)
            setError('Failed to load daily limit')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !limitData) {
        return null // Silently fail to avoid blocking UI
    }

    const { current, limit, hoursUntilReset, percentageUsed, tier } = limitData

    // Determine color based on usage
    const getProgressColor = () => {
        if (percentageUsed >= 90) return 'bg-red-500'
        if (percentageUsed >= 70) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    const getTextColor = () => {
        if (percentageUsed >= 90) return 'text-red-600'
        if (percentageUsed >= 70) return 'text-yellow-600'
        return 'text-green-600'
    }

    const isFreeUser = tier === 'Free'
    const limitReached = current >= limit

    return (
        <Card className="w-full border-2">
            <CardContent className="pt-6 pb-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className={`h-5 w-5 ${getTextColor()}`} />
                            <h3 className="font-semibold text-sm">Daily Job Limit</h3>
                        </div>

                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className={`font-medium ${getTextColor()}`}>
                                {current} / {limit} matched jobs today
                            </span>
                            <span className="text-xs text-gray-500">{percentageUsed}%</span>
                        </div>
                        <Progress
                            value={percentageUsed}
                            className="h-2"
                            indicatorClassName={getProgressColor()}
                        />
                    </div>

                    {/* Limit Reached Warning */}
                    {limitReached && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-red-900">
                                    Daily limit reached
                                </p>
                                <p className="text-xs text-red-700">
                                    Come back in {hoursUntilReset} hours to scrape more jobs
                                    {isFreeUser && ' or upgrade to Premium for higher limits'}
                                </p>
                                {isFreeUser && (
                                    <Link href="/dashboard/billing">
                                        <Button size="sm" variant="destructive" className="mt-2">
                                            Upgrade to Premium
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}


                </div>
            </CardContent>
        </Card>
    )
}
