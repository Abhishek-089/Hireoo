"use client"

import { useState, useRef } from "react"
import { Upload, FileText, X, Search, Briefcase, Calendar, ChevronDown, Loader2, CheckCircle2 } from "lucide-react"

interface SearchInfoStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const EXPERIENCE_LEVELS = [
  { value: "0-1", label: "0–1 Years (Entry Level)" },
  { value: "1-3", label: "1–3 Years (Junior)" },
  { value: "3-5", label: "3–5 Years (Mid-Level)" },
  { value: "5-10", label: "5–10 Years (Senior)" },
  { value: "10+", label: "10+ Years (Lead / Architect)" },
]

const DATE_POSTED_OPTIONS = [
  { value: "r86400", label: "Past 24 hours" },
  { value: "r604800", label: "Past week" },
  { value: "r2592000", label: "Past month" },
]

function NativeSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition"
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  )
}

export function SearchInfoStep({ data, onNext, isFirstStep }: SearchInfoStepProps) {
  const [formData, setFormData] = useState({
    jobKeywords: data?.jobKeywords || [],
    experienceLevel: data?.experienceLevel || "",
    datePosted: data?.datePosted || "r604800",
    resume: data?.resume || null,
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowed.includes(file.type)) { setError("Please select a PDF or Word document (.doc, .docx)"); return }
    if (file.size > 10 * 1024 * 1024) { setError("File size must be less than 10MB"); return }
    uploadResume(file)
  }

  const uploadResume = async (file: File) => {
    setUploading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload/resume", { method: "POST", body: fd })
      const result = await res.json()
      if (!res.ok) { setError(result.error || "Upload failed. Please try again."); return }
      setFormData(prev => ({ ...prev, resume: { fileUrl: result.url, fileName: file.name, uploaded: true } }))
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveResume = () => {
    setFormData(prev => ({ ...prev, resume: null }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const canProceed = formData.jobKeywords.length > 0

  return (
    <div className="space-y-8">

      {/* Section: Job Keyword */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600">
            <Search className="h-3.5 w-3.5" />
          </span>
          Job Keyword
        </label>
        <input
          type="text"
          placeholder="e.g. Frontend Developer, React Engineer…"
          value={formData.jobKeywords[0] || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, jobKeywords: e.target.value ? [e.target.value] : [] }))}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
        <p className="text-xs text-gray-400">Enter the role you're applying for. We'll use this to find matching job posts.</p>
      </div>

      {/* Section: Experience + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600">
              <Briefcase className="h-3.5 w-3.5" />
            </span>
            Years of Experience
          </label>
          <NativeSelect
            value={formData.experienceLevel}
            onChange={(v) => setFormData(prev => ({ ...prev, experienceLevel: v }))}
            options={EXPERIENCE_LEVELS}
            placeholder="Select level…"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600">
              <Calendar className="h-3.5 w-3.5" />
            </span>
            Date Posted
          </label>
          <NativeSelect
            value={formData.datePosted}
            onChange={(v) => setFormData(prev => ({ ...prev, datePosted: v }))}
            options={DATE_POSTED_OPTIONS}
            placeholder="Select range…"
          />
        </div>
      </div>

      {/* Section: Resume Upload */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600">
            <FileText className="h-3.5 w-3.5" />
          </span>
          Resume
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>

        {!formData.resume ? (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group
              ${uploading ? "border-indigo-300 bg-indigo-50/40" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform
              ${uploading ? "bg-indigo-100 text-indigo-500" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 group-hover:scale-110"}`}>
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </div>
            {uploading ? (
              <p className="text-sm font-medium text-indigo-600">Uploading…</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-700">Click to upload your resume</p>
                <p className="text-xs text-gray-400 mt-1">PDF or DOCX — max 10 MB</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
            <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{formData.resume.fileName}</p>
              <p className="text-xs text-emerald-600 font-medium">Uploaded successfully</p>
            </div>
            <button
              onClick={handleRemoveResume}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" disabled={uploading} />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={() => canProceed && onNext(formData)}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm shadow-indigo-200"
        >
          Next Step
        </button>
      </div>

    </div>
  )
}
