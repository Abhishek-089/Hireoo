"use client"

import { useState, useRef } from "react"
import { X, Briefcase, Search, Zap, FileText, Upload, CheckCircle2, Loader2, ChevronDown, Mail, Smile, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const JOB_TYPE_OPTIONS = [
  { value: "freelance",  label: "Freelance",  desc: "Project-based / contract" },
  { value: "full-time",  label: "Full Time",  desc: "Permanent employment" },
  { value: "internship", label: "Internship", desc: "Short-term learning role" },
]

const EXPERIENCE_LEVELS = [
  { value: "0-1",  label: "0–1 Years (Entry Level)" },
  { value: "1-3",  label: "1–3 Years (Junior)" },
  { value: "3-5",  label: "3–5 Years (Mid-Level)" },
  { value: "5-10", label: "5–10 Years (Senior)" },
  { value: "10+",  label: "10+ Years (Lead / Architect)" },
]

const EMAIL_TONES = [
  {
    id: "present_yourself",
    name: "Warm & Personal",
    tagline: "Friendly, approachable",
    icon: Smile,
    defaultSubject: "Interested to learn more!",
    defaultBody: `Hello,

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
    defaultSubject: "Application for {{JOB_TITLE}}",
    defaultBody: `Dear Hiring Manager,

I am writing to express my interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}}.

With my relevant experience and skills, I am confident in my ability to contribute effectively to your team. Please find my resume attached for your consideration.

Thank you for your time.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  {
    id: "expressive",
    name: "Bold & Direct",
    tagline: "Confident, high-energy",
    icon: Zap,
    defaultSubject: "Why I'm the perfect fit for {{JOB_TITLE}}",
    defaultBody: `Hi there,

I saw the opening for {{JOB_TITLE}} at {{COMPANY_NAME}} and I had to reach out — this role has my name written all over it.

I bring hands-on experience and a track record of delivering results. I'd love to jump on a quick call to show you what I can bring to the team.

Resume attached. Let's talk!

Cheers,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
]

export interface EmailTemplateConfig {
  templateId: string
  templateName: string
  subject: string
  body: string
}

export interface PreferencesData {
  current_role: string
  experience_level: string
  skills: string[]
  preferred_job_titles: string[]
  preferred_locations: string[]
  remote_work_preferred: boolean
  job_types: string[]
  resume_uploaded: boolean
  email_template_config: EmailTemplateConfig | null
}

interface EditPreferencesModalProps {
  open: boolean
  onClose: () => void
  initialData: PreferencesData
}

export function EditPreferencesModal({ open, onClose, initialData }: EditPreferencesModalProps) {
  const router = useRouter()

  const [jobType, setJobType]             = useState(initialData.job_types?.[0] || "freelance")
  const [jobKeyword, setJobKeyword]       = useState(initialData.skills?.[0] || "")
  const [experienceLevel, setExperienceLevel] = useState(initialData.experience_level || "")

  // Email template state
  const savedToneId = initialData.email_template_config?.templateId || "present_yourself"
  const savedTone   = EMAIL_TONES.find(t => t.id === savedToneId) ?? EMAIL_TONES[0]
  const [toneId, setToneId]         = useState(savedToneId)
  const [subject, setSubject]       = useState(initialData.email_template_config?.subject || savedTone.defaultSubject)
  const [body, setBody]             = useState(initialData.email_template_config?.body    || savedTone.defaultBody)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Resume state
  const [resumeUploaded, setResumeUploaded] = useState(initialData.resume_uploaded)
  const [resumeName, setResumeName]         = useState("")
  const [uploading, setUploading]           = useState(false)
  const [uploadError, setUploadError]       = useState("")
  const [saving, setSaving]                 = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const handleToneChange = (id: string) => {
    const tone = EMAIL_TONES.find(t => t.id === id)!
    setToneId(id)
    setSubject(tone.defaultSubject)
    setBody(tone.defaultBody)
    setPreviewOpen(true)
  }

  // ── Resume upload ──────────────────────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowed.includes(file.type)) { setUploadError("Please select a PDF or Word document"); return }
    if (file.size > 10 * 1024 * 1024) { setUploadError("File size must be less than 10 MB"); return }

    setUploading(true)
    setUploadError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload/resume", { method: "POST", body: fd })
      const result = await res.json()
      if (!res.ok) { setUploadError(result.error || "Upload failed"); return }
      setResumeUploaded(true)
      setResumeName(file.name)
      await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 2, stepKey: "searchInfo",
          data: { resume: { uploaded: true, fileUrl: result.url, fileName: file.name } },
        }),
      })
    } catch {
      setUploadError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    const tone = EMAIL_TONES.find(t => t.id === toneId)!
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience_level: experienceLevel,
          job_keyword:      jobKeyword,
          job_types:        [jobType],
          email_template_config: {
            templateId:   toneId,
            templateName: tone.name,
            subject,
            body,
          },
        }),
      })
      if (!res.ok) throw new Error("Save failed")
      router.refresh()
      onClose()
    } catch {
      // keep modal open on error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit Preferences</h2>
            <p className="text-xs text-gray-400 mt-0.5">Changes take effect on your next job match cycle.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-7">

          {/* ── Job Type ──────────────────────────────────────────────────── */}
          <section className="space-y-2.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600">
                <Zap className="h-3 w-3" />
              </span>
              Job Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {JOB_TYPE_OPTIONS.map((t) => {
                const active = jobType === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setJobType(t.value)}
                    className={`flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer
                      ${active ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200" : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50"}`}
                  >
                    <span className={`text-xs font-semibold ${active ? "text-indigo-700" : "text-gray-800"}`}>{t.label}</span>
                    <span className="text-[10px] text-gray-400 leading-tight">{t.desc}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Job Keyword ───────────────────────────────────────────────── */}
          <section className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600">
                <Search className="h-3 w-3" />
              </span>
              Job Keyword
              <span className="text-xs font-normal text-gray-400">— primary search term</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer, React Engineer…"
              value={jobKeyword}
              onChange={(e) => setJobKeyword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </section>

          {/* ── Experience Level ──────────────────────────────────────────── */}
          <section className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600">
                <Briefcase className="h-3 w-3" />
              </span>
              Years of Experience
            </label>
            <div className="relative">
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition"
              >
                <option value="" disabled hidden>Select your experience level…</option>
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </section>

          {/* ── Email Template ────────────────────────────────────────────── */}
          <section className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600">
                <Mail className="h-3 w-3" />
              </span>
              Email Template
            </label>

            {/* Tone cards */}
            <div className="grid grid-cols-3 gap-2">
              {EMAIL_TONES.map((tone) => {
                const active = toneId === tone.id
                const Icon = tone.icon
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => handleToneChange(tone.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-all cursor-pointer",
                      active
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center mb-0.5 transition-colors",
                      active ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
                    )}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className={cn("text-xs font-semibold leading-tight", active ? "text-indigo-700" : "text-gray-800")}>
                      {tone.name}
                    </span>
                    <span className="text-[10px] text-gray-400 leading-tight">{tone.tagline}</span>
                    {active && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Editable preview (collapsible) */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setPreviewOpen(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide shrink-0">Edit email</span>
                  <span className="text-[11px] text-gray-400 font-medium truncate">· {subject}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-gray-400 shrink-0 transition-transform ml-2", previewOpen && "rotate-180")} />
              </button>

              {previewOpen && (
                <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-3">
                  {/* Subject line */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Subject</p>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* Body */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Body</p>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={10}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition"
                    />
                  </div>

                  <p className="text-[11px] text-indigo-500 font-medium">
                    ✦ Variables like {`{{JOB_TITLE}}`}, {`{{COMPANY_NAME}}`}, {`{{USER_FIRSTNAME}}`} are filled in automatically for each job.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Resume ────────────────────────────────────────────────────── */}
          <section className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600">
                <FileText className="h-3 w-3" />
              </span>
              Resume
              <span className="text-xs font-normal text-gray-400">(optional)</span>
            </label>

            {resumeUploaded && !resumeName ? (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">Resume already uploaded</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="ml-auto text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer whitespace-nowrap"
                >
                  Replace
                </button>
              </div>
            ) : resumeName ? (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-sm text-gray-900 font-medium truncate flex-1">{resumeName}</p>
                <span className="text-xs text-emerald-600 font-medium shrink-0">Uploaded</span>
              </div>
            ) : (
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer group
                  ${uploading ? "border-indigo-300 bg-indigo-50/40" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all
                  ${uploading ? "bg-indigo-100 text-indigo-500" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"}`}
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                </div>
                <p className="text-sm font-medium text-gray-700">{uploading ? "Uploading…" : "Click to upload resume"}</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF or DOCX — max 10 MB</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" disabled={uploading} />
            {uploadError && <p className="text-xs text-red-500 font-medium">{uploadError}</p>}
          </section>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save Preferences"}
          </button>
        </div>

      </div>
    </div>
  )
}
