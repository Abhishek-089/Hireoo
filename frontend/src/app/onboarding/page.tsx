"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SearchInfoStep } from "@/components/onboarding/SearchInfoStep"
import { EmailTemplateStep } from "@/components/onboarding/EmailTemplateStep"
import { SettingsStep } from "@/components/onboarding/SettingsStep"
import { ProgressBar } from "@/components/onboarding/ProgressBar"

// New 3-step configuration
const STEPS = [
  { id: 1, title: "Search Info", component: SearchInfoStep },
  { id: 2, title: "Email Template", component: EmailTemplateStep },
  { id: 3, title: "Settings", component: SettingsStep },
]

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Consolidated State
  const [onboardingData, setOnboardingData] = useState({
    searchInfo: {},
    emailTemplate: {},
    settings: {},
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/signin")
      return
    }

    // Fetch current onboarding step from database
    fetchOnboardingProgress()
  }, [session, status, router])

  const fetchOnboardingProgress = async () => {
    try {
      const response = await fetch("/api/onboarding/progress")
      if (response.ok) {
        const data = await response.json()
        
        // Map backend flat structure to component state structure
        const mappedData = {
            searchInfo: {
                jobKeywords: data.jobKeywords,
                experienceLevel: data.experienceLevel,
                datePosted: data.datePosted,
                resume: data.resume,
            },
            emailTemplate: {
                templateId: data.templateId,
                templateName: data.templateName,
                subject: data.subject,
                body: data.body,
            },
            settings: {
                extensionInstalled: data.extensionInstalled,
                completed: data.completed
            }
        }
        
        setOnboardingData(mappedData)

        // Determine correct step based on data presence
        let step = 1
        if (data.jobKeywords && data.jobKeywords.length > 0) {
             step = data.onboarding_step || 1
        }
        // Cap step at 3
        if (step > 3) step = 3
        
        setCurrentStep(step)
      }
    } catch (error) {
      console.error("Failed to fetch onboarding progress:", error)
    } finally {
        setIsLoadingData(false)
    }
  }

  const handleNext = async (stepData?: any) => {
    if (stepData) {
      const stepKey = getStepKey(currentStep)
      
      // Update local state
      setOnboardingData(prev => ({
        ...prev,
        [stepKey]: {
            ...prev[stepKey as keyof typeof prev], // Merge existsing
            ...stepData
        },
      }))

      // Save to backend
      try {
        await fetch("/api/onboarding/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: currentStep,
            data: stepData,
            stepKey // Send key so backend knows what data this is
          }),
        })
      } catch (error) {
        console.error("Failed to save step data:", error)
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // Onboarding complete
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
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

  if (status === "loading" || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const CurrentStepComponent = STEPS[currentStep - 1]?.component

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header - Updated Text */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Let's Personalize Your Experience
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us what you're looking for, and we'll configure the perfect automation strategy for you.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="py-4">
             <ProgressBar steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
             
             {/* Top accent bar */}
             <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-full" />
             
             <div className="p-8 md:p-12">
                {CurrentStepComponent && (
                    <CurrentStepComponent
                        data={onboardingData[getStepKey(currentStep) as keyof typeof onboardingData]}
                        onNext={handleNext}
                        onBack={handleBack}
                        isFirstStep={currentStep === 1}
                        isLastStep={currentStep === STEPS.length}
                    />
                )}
             </div>
        </div>

        {/* Step Indicator */}
        <div className="text-center">
             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-500 border border-gray-200 shadow-sm">
                Step {currentStep} of {STEPS.length} • {STEPS[currentStep - 1]?.title}
             </span>
        </div>

      </div>
    </div>
  )
}
