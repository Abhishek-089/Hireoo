"use client"

import { useState } from "react"
import { Check, Star, Mail, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailTemplateStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const POPULAR_TEMPLATES = [
  {
    id: "present_yourself",
    name: "Present Yourself",
    tagline: "Warm & personal",
    subject: "Interested to learn more!",
    body: `Hello,

I came across your job posted here: {{JOB_URL}} regarding an opportunity in {{JOB_LOCATION}}

I am interested in applying for the position of {{JOB_TITLE}} at {{COMPANY_NAME}}.

After reading the job description and requirements and matching it with my own experiences, I know that it fits great with my profile. I have attached my resume for your consideration.

Please take a moment to go through it to get a better picture of who I am. I would love to talk to you in more detail regarding this opportunity.

Sincerely,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  {
    id: "direct_application",
    name: "Direct Application",
    tagline: "Professional & concise",
    subject: "Application for {{JOB_TITLE}}",
    body: `Dear Hiring Manager,

I am writing to express my strong interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}}.

With my background in [Your Field] and experience with [Key Skill 1] and [Key Skill 2], I am confident in my ability to contribute effectively to your team.

I have attached my resume which outlines my qualifications in more detail.

Thank you for your time and consideration.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  {
    id: "expressive",
    name: "The Expressive",
    tagline: "Enthusiastic & bold",
    subject: "Why I'm the perfect fit for {{JOB_TITLE}}",
    body: `Hi there,

I've been following {{COMPANY_NAME}} for a while and was thrilled to see the opening for {{JOB_TITLE}}.

I believe my unique blend of skills in [Skill 1] and [Skill 2] makes me an ideal candidate for this role. I'm particularly passionate about [Company Value/Mission].

Attached is my resume. I look forward to the possibility of discussing how I can contribute to your team's success.

Cheers,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
]

const PLACEHOLDERS = [
  "{{JOB_TITLE}}",
  "{{COMPANY_NAME}}",
  "{{JOB_URL}}",
  "{{JOB_LOCATION}}",
  "{{USER_FIRSTNAME}}",
  "{{USER_LASTNAME}}",
]

export function EmailTemplateStep({ data, onNext, onBack }: EmailTemplateStepProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(data?.templateId || "present_yourself")
  const [subject, setSubject] = useState(data?.subject || POPULAR_TEMPLATES[0].subject)
  const [body, setBody] = useState(data?.body || POPULAR_TEMPLATES[0].body)
  const [templateName, setTemplateName] = useState(data?.templateName || POPULAR_TEMPLATES[0].name)

  const handleTemplateSelect = (template: typeof POPULAR_TEMPLATES[0]) => {
    setSelectedTemplateId(template.id)
    setSubject(template.subject)
    setBody(template.body)
    setTemplateName(template.name)
  }

  const insertPlaceholder = (ph: string) => setBody((prev: string) => prev + " " + ph)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

      {/* Left: template picker */}
      <div className="lg:col-span-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Choose a Template</h3>
          <p className="text-xs text-gray-400 mt-0.5">Select a starting point, then customize it on the right.</p>
        </div>

        <div className="space-y-2.5">
          {POPULAR_TEMPLATES.map((template) => {
            const active = selectedTemplateId === template.id
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all cursor-pointer",
                  active
                    ? "bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400"
                    : "bg-gray-50 border-gray-200 hover:border-indigo-200 hover:bg-white"
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={cn("text-sm font-semibold", active ? "text-indigo-700" : "text-gray-800")}>{template.name}</span>
                  {active && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-white stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className={cn("text-xs", active ? "text-indigo-500" : "text-gray-400")}>{template.tagline}</span>
              </button>
            )
          })}
        </div>

        {/* Tip */}
        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            You can update your template anytime from Settings. Customize the body for the best reply rates.
          </p>
        </div>
      </div>

      {/* Right: editor */}
      <div className="lg:col-span-8 space-y-5">

        {/* Template name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Template Name</label>
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <Mail className="h-3.5 w-3.5" /> Email Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject…"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Body</label>
            <span className="text-xs text-gray-400">Click a variable to insert:</span>
          </div>
          {/* Placeholder chips */}
          <div className="flex flex-wrap gap-1.5">
            {PLACEHOLDERS.map((ph) => (
              <button
                key={ph}
                onClick={() => insertPlaceholder(ph)}
                className="px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition cursor-pointer"
              >
                {ph}
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono leading-relaxed text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={() => onNext({ templateId: selectedTemplateId, templateName, subject, body })}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition cursor-pointer shadow-sm shadow-indigo-200"
          >
            Next Step
          </button>
        </div>

      </div>
    </div>
  )
}
