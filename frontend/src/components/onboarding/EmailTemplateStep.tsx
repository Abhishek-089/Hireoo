"use client"

import { useState } from "react"
import { Check, Smile, Briefcase, Zap, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailTemplateStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const TONES = [
  {
    id: "present_yourself",
    name: "Warm & Personal",
    tagline: "Friendly, approachable tone",
    icon: Smile,
    subject: "Interested to learn more!",
    body: `Hello,

I came across your job posting and I'm very interested in the {{JOB_TITLE}} role at {{COMPANY_NAME}}.

My background aligns well with what you're looking for, and I'd love the opportunity to discuss how I can contribute to your team.

I've attached my resume for your review.

Looking forward to hearing from you!

Sincerely,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  {
    id: "direct_application",
    name: "Professional",
    tagline: "Clear, concise & formal",
    icon: Briefcase,
    subject: "Application for {{JOB_TITLE}}",
    body: `Dear Hiring Manager,

I am writing to express my interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}}.

With my relevant experience and skills, I am confident in my ability to contribute effectively to your team. Please find my resume attached for your consideration.

Thank you for your time.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  {
    id: "expressive",
    name: "Bold & Direct",
    tagline: "Confident, high-energy tone",
    icon: Zap,
    subject: "Why I'm the perfect fit for {{JOB_TITLE}}",
    body: `Hi there,

I saw the opening for {{JOB_TITLE}} at {{COMPANY_NAME}} and I had to reach out — this role has my name written all over it.

I bring hands-on experience and a track record of delivering results. I'd love to jump on a quick call to show you what I can bring to the team.

Resume attached. Let's talk!

Cheers,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
]

export function EmailTemplateStep({ data, onNext, onBack }: EmailTemplateStepProps) {
  const [selectedId, setSelectedId] = useState<string>(data?.templateId || "present_yourself")
  const [previewOpen, setPreviewOpen] = useState(false)

  const selected = TONES.find((t) => t.id === selectedId)!

  return (
    <div className="space-y-5">

      {/* Heading */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Choose your email tone</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Hireoo uses this to write personalised cold emails for each job. You can change it anytime in Settings.
        </p>
      </div>

      {/* Tone cards */}
      <div className="grid grid-cols-3 gap-3">
        {TONES.map((tone) => {
          const active = selectedId === tone.id
          const Icon = tone.icon
          return (
            <button
              key={tone.id}
              type="button"
              onClick={() => { setSelectedId(tone.id); setPreviewOpen(false) }}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-xl border px-4 py-3.5 text-left transition-all cursor-pointer",
                active
                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                  : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-colors",
                active ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn("text-sm font-semibold leading-tight", active ? "text-indigo-700" : "text-gray-800")}>
                {tone.name}
              </span>
              <span className="text-[11px] text-gray-400 leading-tight">{tone.tagline}</span>
              {active && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white stroke-[3]" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Email preview (collapsible) */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setPreviewOpen((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Preview email</span>
            <span className="text-[11px] text-gray-400 font-medium truncate max-w-[260px]">
              · {selected.subject}
            </span>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", previewOpen && "rotate-180")} />
        </button>

        {previewOpen && (
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans">
              {selected.body}
            </pre>
            <p className="text-[11px] text-indigo-500 mt-3 font-medium">
              ✦ Variables like {`{{JOB_TITLE}}`} are filled in automatically for each job.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={() => onNext({
            templateId: selected.id,
            templateName: selected.name,
            subject: selected.subject,
            body: selected.body,
          })}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition cursor-pointer shadow-sm shadow-indigo-200"
        >
          Next Step
        </button>
      </div>

    </div>
  )
}
