"use client"

import { Button } from "@/components/ui/button"
import { Chrome, CheckCircle, ExternalLink } from "lucide-react"

interface ExtensionInstallStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export function ExtensionInstallStep({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: ExtensionInstallStepProps) {
  const handleInstall = () => {
    // TODO: Implement extension installation check
    // For now, just simulate installation
    onNext({
      extensionInstalled: true,
    })
  }

  const handleSkip = () => {
    onNext({
      extensionInstalled: false,
      skipped: true,
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Install Chrome Extension</h2>
        <p className="text-gray-600">
          Get the Hireoo Chrome extension to automatically capture job opportunities
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Chrome className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Hireoo Chrome Extension
          </h3>
          <p className="text-gray-600 mb-6">
            Browse professional networks as usual and let our extension automatically find and analyze job postings for you.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-center text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Automatic job detection</span>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Real-time analysis</span>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Privacy-focused capture</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Installation Steps:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Click "Install Extension" below</li>
              <li>2. You'll be redirected to Chrome Web Store</li>
              <li>3. Click "Add to Chrome" to install</li>
              <li>4. Pin the extension for easy access</li>
            </ol>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              You can install the extension later from your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep}
        >
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button onClick={handleInstall}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Install Extension
          </Button>
        </div>
      </div>
    </div>
  )
}
