"use client"

import { Button } from "@/components/ui/button"
import { Check, Chrome, Shield, ExternalLink, ArrowRight, Loader2, X } from "lucide-react"
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

    const handleComplete = async () => {
        // Trigger extension automation if installed
        if (isInstalled) {
            try {
                // @ts-ignore
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                    await new Promise<void>((resolve) => {
                        // @ts-ignore
                        chrome.runtime.sendMessage(EXTENSION_CONFIG.id, {
                            type: 'START_HIDDEN_RUNNER',
                            source: 'ONBOARDING'
                        }, (response: any) => {
                            // @ts-ignore
                            if (chrome.runtime.lastError) {
                                // @ts-ignore
                                console.error('[Onboarding] Failed to trigger automation:', chrome.runtime.lastError)
                                // @ts-ignore
                                alert(`Extension connection failed: ${chrome.runtime.lastError.message}`)
                            } else {
                                console.log('[Onboarding] Automation triggered:', response)
                            }
                            resolve()
                        })

                        // Safety timeout - don't block onboarding if extension doesn't respond
                        setTimeout(() => {
                            console.warn('[Onboarding] Extension response timed out')
                            resolve()
                        }, 1000)
                    })
                }
            } catch (error) {
                console.error('[Onboarding] Error triggering automation:', error)
            }
        }

        // Save any final settings & complete
        onNext({ completed: true })
    }

    const handleInstallExtension = () => {
        window.open(EXTENSION_CONFIG.storeUrl, "_blank", "noopener,noreferrer")
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Setup</h2>
                <p className="text-gray-600">Review your settings and get ready to launch.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                {/* 1. Extension Check */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                        <Chrome className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Extension</h3>
                    <p className="text-sm text-gray-500 mb-6">Required for automating applications on LinkedIn.</p>

                    <div className="flex gap-3 items-center">
                        {!isInstalled && (
                            <Button variant="outline" className="flex-1" onClick={handleInstallExtension}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Install
                            </Button>
                        )}

                        {/* Real-time Status */}
                        {isChecking ? (
                            <div className="flex items-center text-sm text-gray-500 font-medium">
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                Checking...
                            </div>
                        ) : isInstalled ? (
                            <div className="flex items-center text-sm text-green-600 font-medium">
                                <Check className="w-4 h-4 mr-1" />
                                Ready
                            </div>
                        ) : (
                            <div className="flex items-center text-sm text-orange-600 font-medium">
                                <X className="w-4 h-4 mr-1" />
                                Not Installed
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Privacy & Safety */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe Mode</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Human-like behavior enabled to keep your account safe while automating.
                    </p>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <span className="text-sm font-medium text-green-600 flex items-center">
                            <Check className="w-4 h-4 mr-1" /> Active
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col items-center pt-8 border-t border-gray-100 mt-8">
                <Button
                    size="lg"
                    onClick={handleComplete}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] h-12 text-base shadow-xl shadow-blue-600/20 group"
                >
                    Complete & Start Automation
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <button onClick={onBack} className="mt-4 text-sm text-gray-500 hover:text-gray-900 font-medium">
                    Back
                </button>
            </div>

        </div>
    )
}
