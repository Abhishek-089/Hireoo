"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SearchInfoStep } from "@/components/onboarding/SearchInfoStep"
import { EmailTemplateStep } from "@/components/onboarding/EmailTemplateStep"
import { SettingsStep } from "@/components/onboarding/SettingsStep"
import { ProgressBar } from "@/components/onboarding/ProgressBar"
import { Loader2 } from "lucide-react"
import posthog from "posthog-js"

const STEPS = [
  { id: 1, title: "Search Info", component: SearchInfoStep },
  { id: 2, title: "Email Template", component: EmailTemplateStep },
  { id: 3, title: "Finish", component: SettingsStep },
]

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [onboardingData, setOnboardingData] = useState({
    searchInfo: {},
    emailTemplate: {},
    settings: {},
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.push("/signin"); return }
    fetchOnboardingProgress()
  }, [session, status, router])

  const fetchOnboardingProgress = async () => {
    try {
      const response = await fetch("/api/onboarding/progress")
      if (response.ok) {
        const data = await response.json()
        const mappedData = {
          searchInfo: { jobKeywords: data.jobKeywords, jobType: data.jobType, experienceLevel: data.experienceLevel, datePosted: data.datePosted, resume: data.resume },
          emailTemplate: { templateId: data.templateId, templateName: data.templateName, subject: data.subject, body: data.body },
          settings: { extensionInstalled: data.extensionInstalled, completed: data.completed },
        }
        setOnboardingData(mappedData)
        let step = 1
        if (data.jobKeywords && data.jobKeywords.length > 0) step = data.onboarding_step || 1
        if (step > 3) step = 3
        setCurrentStep(step)
      }
    } catch (error) {
      console.error("Failed to fetch onboarding progress:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const getStepKey = (step: number) => {
    switch (step) {
      case 1: return "searchInfo"
      case 2: return "emailTemplate"
      case 3: return "settings"
      default: return "searchInfo"
    }
  }

  const handleNext = async (stepData?: any) => {
    if (stepData) {
      const stepKey = getStepKey(currentStep)
      setOnboardingData(prev => ({ ...prev, [stepKey]: { ...prev[stepKey as keyof typeof prev], ...stepData } }))
      try {
        await fetch("/api/onboarding/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: currentStep, data: stepData, stepKey }),
        })
      } catch (error) {
        console.error("Failed to save step data:", error)
      }
    }
    posthog.capture("onboarding_step_completed", {
      step: currentStep,
      step_name: STEPS[currentStep - 1]?.title,
    })

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      posthog.capture("onboarding_completed")
      router.push("/dashboard/job-matches?from=onboarding")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      posthog.capture("onboarding_step_back", {
        from_step: currentStep,
        from_step_name: STEPS[currentStep - 1]?.title,
      })
      setCurrentStep(currentStep - 1)
    }
  }

  if (status === "loading" || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-gray-500 font-medium">Loading your profile…</p>
        </div>
      </div>
    )
  }

  const CurrentStepComponent = STEPS[currentStep - 1]?.component

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Start Your Job Search</h1>
        <p className="text-sm text-gray-500">
          Set up once — Hireoo handles the rest automatically.
        </p>
      </div>

      {/* Progress */}
      <ProgressBar steps={STEPS} currentStep={currentStep} />

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Indigo top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="p-6 md:p-10">
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={
                currentStep === STEPS.length
                  ? onboardingData          // last step gets ALL data for review
                  : onboardingData[getStepKey(currentStep) as keyof typeof onboardingData]
              }
              onNext={handleNext}
              onBack={handleBack}
              isFirstStep={currentStep === 1}
              isLastStep={currentStep === STEPS.length}
            />
          )}
        </div>
      </div>

      {/* Step label */}
      <p className="text-center text-xs text-gray-400">
        Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1]?.title}
      </p>

    </div>
  )
}
