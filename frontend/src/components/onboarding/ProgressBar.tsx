import { Check } from "lucide-react"

interface Step {
  id: number
  title: string
  component: React.ComponentType<any>
}

interface ProgressBarProps {
  steps: Step[]
  currentStep: number
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isDone = step.id < currentStep
        const isActive = step.id === currentStep

        return (
          <div key={step.id} className="flex items-center">
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0 ${
                isDone
                  ? "bg-emerald-500 text-white"
                  : isActive
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : step.id}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${
                isActive ? "text-indigo-700" : isDone ? "text-emerald-600" : "text-gray-400"
              }`}>
                {step.title}
              </span>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-24 sm:w-32 mx-3 mb-5 rounded-full transition-colors ${
                step.id < currentStep ? "bg-emerald-400" : "bg-gray-200"
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
