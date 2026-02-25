'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface DailyLimitReachedModalProps {
    isOpen: boolean
    onClose: () => void
    current: number
    limit: number
    hoursUntilReset: number
    tier: string
}

export function DailyLimitReachedModal({
    isOpen,
    onClose,
    current,
    limit,
    hoursUntilReset,
    tier
}: DailyLimitReachedModalProps) {
    const isFreeUser = tier === 'Free'

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-red-100 rounded-full">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold">Daily Limit Reached</h2>
                </div>
                <p className="text-gray-500 text-sm mb-4">You&apos;ve reached your daily job limit.</p>

                <div className="space-y-4">
                    {/* Stats */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Matched Jobs Today</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">{current} / {limit}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Reset In</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">{hoursUntilReset} hours</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Current Plan</span>
                                <span className="text-sm font-semibold text-gray-900">{tier}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-700">
                        {isFreeUser ? (
                            <>You&apos;ve scraped <span className="font-semibold">{current} matched jobs</span> today. Come back tomorrow or upgrade for higher limits!</>
                        ) : (
                            <>Your limit resets in <span className="font-semibold">{hoursUntilReset} hours</span>.</>
                        )}
                    </p>

                    {isFreeUser && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                            <h4 className="font-semibold text-blue-900">Upgrade to Premium</h4>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li>• <strong>Basic (₹149/mo):</strong> 25 matched jobs/day</li>
                                <li>• <strong>Pro (₹249/mo):</strong> 50 matched jobs/day</li>
                            </ul>
                            <Link href="/dashboard/billing">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">Upgrade Now</Button>
                            </Link>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
                        {!isFreeUser && (
                            <Link href="/dashboard" className="flex-1">
                                <Button className="w-full">Go to Dashboard</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
