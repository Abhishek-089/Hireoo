"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Chrome, Shield, ExternalLink, Loader2, X, Sparkles, Search } from "lucide-react"
import { useExtensionDetection } from "@/hooks/useExtensionDetection"
import { EXTENSION_CONFIG } from "@/config/extension"

interface SettingsStepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    isFirstStep: boolean
    isLastStep: boolean
}

export function SettingsStep({
    data,
    onNext,
    onBack,
    isFirstStep,
    isLastStep,
}: SettingsStepProps) {
    const { isInstalled, isChecking } = useExtensionDetection()
    const [isStarting, setIsStarting] = useState(false)

    const handleStartSearching = async () => {
        setIsStarting(true)

        if (isInstalled) {
            try {
                // @ts-ignore
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                    await new Promise<void>((resolve) => {
                        // @ts-ignore
                        chrome.runtime.sendMessage(EXTENSION_CONFIG.id, {
                            type: 'START_HIDDEN_RUNNER',
                            source: 'ONBOARDING'
                        }, () => {
                            resolve()
                        })
                        setTimeout(() => resolve(), 1000)
                    })
                }
            } catch (error) {
                console.error('[Onboarding] Error triggering automation:', error)
            }
        }

        onNext({ completed: true })
    }

    const handleInstallExtension = () => {
        window.open(EXTENSION_CONFIG.storeUrl, "_blank", "noopener,noreferrer")
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
                <p className="text-gray-600">We'll search our database for the best matching jobs based on your preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

                {/* Precision mode - Extension */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                        <Chrome className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Want More Precise Results?</h3>
                    <p className="text-sm text-gray-600 mb-5">
                        Install our browser extension to get real-time LinkedIn scraping and automated applications.
                    </p>

                    <div className="flex gap-3 items-center">
                        {!isInstalled && (
                            <Button variant="outline" className="flex-1 border-amber-300 hover:bg-amber-100" onClick={handleInstallExtension}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Install Extension
                            </Button>
                        )}

                        {isChecking ? (
                            <div className="flex items-center text-sm text-gray-500 font-medium">
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                Checking...
                            </div>
                        ) : isInstalled ? (
                            <div className="flex items-center text-sm text-green-600 font-medium">
                                <Check className="w-4 h-4 mr-1" />
                                Installed & Ready
                            </div>
                        ) : (
                            <div className="flex items-center text-sm text-gray-500 font-medium">
                                Optional
                            </div>
                        )}
                    </div>
                </div>

                {/* Safety info */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Safe & Smart Matching</h3>
                    <p className="text-sm text-gray-600 mb-5">
                        We use AI to match your profile with the most relevant job postings scraped from LinkedIn.
                    </p>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <span className="text-sm font-medium text-green-600 flex items-center">
                            <Check className="w-4 h-4 mr-1" /> Active
                        </span>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center pt-8 border-t border-gray-100 mt-8">
                <Button
                    size="lg"
                    onClick={handleStartSearching}
                    disabled={isStarting}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[260px] h-14 text-base shadow-xl shadow-blue-600/20 group"
                >
                    {isStarting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Preparing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            Start Searching Jobs
                        </>
                    )}
                </Button>
                <p className="mt-3 text-xs text-gray-400">
                    We'll find the best matches from thousands of scraped LinkedIn postings
                </p>
                <button onClick={onBack} className="mt-4 text-sm text-gray-500 hover:text-gray-900 font-medium">
                    Back
                </button>
            </div>

        </div>
    )
}
