"use client"

import { Button } from "@/components/ui/button"
import { Mail, CheckCircle } from "lucide-react"
import { signIn } from "next-auth/react"

interface GmailConnectStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export function GmailConnectStep({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: GmailConnectStepProps) {
  const handleConnect = () => {
    // Trigger real Google OAuth flow via NextAuth.
    // User will be redirected back to /onboarding after connecting Gmail.
    signIn("google", { callbackUrl: "/onboarding" })

    // Advance to the next onboarding step, but DO NOT mark Gmail as connected
    // here. The real connection status is based on whether Gmail credentials
    // exist in the database (set in the NextAuth sign-in callback).
    onNext({})
  }

  const handleSkip = () => {
    onNext({
      gmailConnected: false,
      skipped: true,
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Gmail</h2>
        <p className="text-gray-600">
          Allow Hireoo to send personalized cold emails from your Gmail account
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Mail className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Secure Gmail Integration
          </h3>
          <p className="text-gray-600 mb-6">
            We'll use OAuth 2.0 to securely connect to your Gmail account.
            We never store your password and only access what you authorize.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-center text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Secure OAuth connection</span>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Send emails from your account</span>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Track responses automatically</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            You can connect Gmail later from your dashboard settings.
          </p>
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
          <Button onClick={handleConnect}>
            Connect Gmail
          </Button>
        </div>
      </div>
    </div>
  )
}
