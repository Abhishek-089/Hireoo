"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Check, Copy, RefreshCw, Star, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
// ... (skip down to insertPlaceholder)

// Inside the component

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
    name: "Present yourself",
    subject: "Interested to learn more!",
    body: `Hello,

I came across your job posted here: {{JOB_URL}} regarding an opportunity in {{JOB_LOCATION}}

I am interested in applying for the position of {{JOB_TITLE}} at {{COMPANY_NAME}}.

After reading the job description and requirements and matching it with my own experiences, I know that it fits great with my profile. I have attached my resume for your consideration.

Please take a moment to go through it to get a better picture of who I am. I would love to talk to you in more detail regarding this opportunity.

Sincerely,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
  },
  {
    id: "direct_application",
    name: "Direct Application",
    subject: "Application for {{JOB_TITLE}}",
    body: `Dear Hiring Manager,

I am writing to express my strong interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}}.

With my background in [Your Field] and experience with [Key Skill 1] and [Key Skill 2], I am confident in my ability to contribute effectively to your team.

I have attached my resume which outlines my qualifications in more detail.

Thank you for your time and consideration.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
  },
  {
    id: "expressive",
    name: "The Expressive",
    subject: "Why I'm the perfect fit for {{JOB_TITLE}}",
    body: `Hi there,

I've been following {{COMPANY_NAME}} for a while and was thrilled to see the opening for {{JOB_TITLE}}.

I believe my unique blend of skills in [Skill 1] and [Skill 2] makes me an ideal candidate for this role. I'm particularly passionate about [Company Value/Mission].

Attached is my resume. I look forward to the possibility of discussing how I can contribute to your team's success.

Cheers,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
  }
]

const PLACEHOLDERS = [
  "{{JOB_TITLE}}",
  "{{COMPANY_NAME}}",
  "{{JOB_URL}}",
  "{{JOB_LOCATION}}",
  "{{USER_FIRSTNAME}}",
  "{{USER_LASTNAME}}"
]

export function EmailTemplateStep({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: EmailTemplateStepProps) {
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

  const insertPlaceholder = (placeholder: string) => {
    // Simple append for now, ideally insert at cursor
    setBody((prev: string) => prev + " " + placeholder)
  }

  const handleNext = () => {
      onNext({
          templateId: selectedTemplateId,
          templateName,
          subject,
          body
      })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sidebar - Template Selection */}
      <div className="lg:col-span-4 space-y-6">
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Template</h3>
            <p className="text-sm text-gray-500 mb-4">Choose a starting point for your emails.</p>
        </div>
        
        <div className="space-y-3">
            {POPULAR_TEMPLATES.map((template) => (
                <div 
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={cn(
                        "p-4 rounded-xl border border-gray-200 cursor-pointer transition-all hover:border-blue-300 hover:shadow-md",
                        selectedTemplateId === template.id ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" : "bg-white"
                    )}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">{template.name}</span>
                        {selectedTemplateId === template.id && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{template.body}</p>
                </div>
            ))}
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Pro Tip
            </h4>
            <p className="text-xs text-gray-600">
                You can create custom templates in your settings later. For now, customize one of these to get started.
            </p>
        </div>
      </div>

      {/* Main Content - Editor */}
      <div className="lg:col-span-8 space-y-6">
        
        <div className="space-y-4">
             {/* Template Name */}
             <div className="grid grid-cols-1 gap-2">
                <Label className="text-sm font-medium text-gray-700">Template Name</Label>
                <Input 
                    value={templateName} 
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="bg-white"
                />
            </div>

            {/* Subject */}
            <div className="grid grid-cols-1 gap-2">
                <Label className="text-sm font-medium text-gray-700">Email Subject</Label>
                <Input 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-white"
                    placeholder="Enter email subject"
                />
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 gap-2 relative">
                <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm font-medium text-gray-700">Email Body</Label>
                    <div className="flex gap-2">
                         {/* Placeholder chips - simplified */}
                         <span className="text-xs text-gray-400">Insert variables:</span>
                    </div>
                </div>
                
                {/* Visual Placeholder Bar */}
                <div className="flex flex-wrap gap-1 mb-2">
                    {PLACEHOLDERS.map(ph => (
                        <Badge 
                            key={ph} 
                            variant="outline" 
                            className="text-xs cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            onClick={() => insertPlaceholder(ph)}
                        >
                            {ph}
                        </Badge>
                    ))}
                </div>

                <Textarea 
                    value={body} 
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-[300px] font-mono text-sm leading-relaxed bg-white border-gray-200 resize-none p-4"
                />
            </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
             <Button variant="ghost" onClick={onBack} className="text-gray-500 hover:text-gray-900">
                Back
             </Button>
             <Button 
                size="lg" 
                onClick={handleNext} 
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-600/20"
             >
                Next Step
             </Button>
        </div>

      </div>

    </div>
  )
}
