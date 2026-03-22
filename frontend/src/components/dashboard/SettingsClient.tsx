"use client"

import { useState, useCallback } from "react"
import { signOut } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  User, MapPin, X, Plus, Save, CheckCircle2,
  Loader2, LogOut, Mail, Shield, Wrench, SlidersHorizontal,
  FileText,
} from "lucide-react"

interface SettingsData {
  name: string
  email: string
  image: string | null
  currentRole: string
  experienceLevel: string
  skills: string[]
  preferredJobTitles: string[]
  preferredLocations: string[]
  remoteWorkPreferred: boolean
  jobTypes: string[]
  resumeUploaded: boolean
  gmailConnected: boolean
  extensionInstalled: boolean
  emailTemplateConfig: any
  createdAt: string
  latestResumeFileName: string | null
}

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level (0–2 years)" },
  { value: "junior", label: "Junior (2–4 years)" },
  { value: "mid", label: "Mid-Level (4–7 years)" },
  { value: "senior", label: "Senior (7–10 years)" },
  { value: "lead", label: "Lead / Principal (10+ years)" },
  { value: "executive", label: "Executive / C-Suite" },
]

const JOB_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
  { id: "remote", label: "Remote" },
]

const POPULAR_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "React", "Node.js",
  "Next.js", "Vue.js", "Angular", "Go", "Rust", "C++",
  "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "Redis",
  "GraphQL", "REST APIs", "Tailwind CSS", "Figma", "Git",
  "Machine Learning", "Data Analysis", "Agile", "Scrum",
]

const POPULAR_JOB_TITLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "Product Manager", "UX Designer",
  "DevOps Engineer", "Data Scientist", "Data Engineer",
  "Machine Learning Engineer", "QA Engineer", "Technical Writer",
]

/** Maps stored experience_level values (settings + onboarding) to a readable label */
const EXPERIENCE_LABEL_BY_VALUE: Record<string, string> = {
  entry: "Entry Level (0–2 years)",
  junior: "Junior (2–4 years)",
  mid: "Mid-Level (4–7 years)",
  senior: "Senior (7–10 years)",
  lead: "Lead / Principal (10+ years)",
  executive: "Executive / C-Suite",
  "0-1": "0–1 Years (Entry Level)",
  "1-3": "1–3 Years (Junior)",
  "3-5": "3–5 Years (Mid-Level)",
  "5-10": "5–10 Years (Senior)",
  "10+": "10+ Years (Lead / Architect)",
}

function formatExperienceLabel(level: string): string {
  if (!level?.trim()) return "—"
  return EXPERIENCE_LABEL_BY_VALUE[level] ?? level.replace(/-/g, " ")
}

function formatJobTypeLabels(ids: string[]): string[] {
  if (!ids?.length) return []
  return ids.map((id) => JOB_TYPES.find((j) => j.id === id)?.label ?? id.replace(/-/g, " "))
}

function formatEmailFormatPreview(config: { templateName?: string; templateId?: string } | null | undefined): string {
  if (!config) return "Not set"
  if (config.templateName?.trim()) return config.templateName
  if (config.templateId) {
    const map: Record<string, string> = {
      present_yourself: "Warm & Personal",
      direct_application: "Professional",
      expressive: "Bold & Direct",
    }
    return map[config.templateId] ?? config.templateId.replace(/_/g, " ")
  }
  return "Custom template"
}

function PreferenceRow({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(8rem,11rem)_1fr] gap-1 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="text-sm text-gray-900 min-h-[1.25rem]">
        {children ?? (value === undefined || value === "" || value === null ? <span className="text-gray-400">—</span> : value)}
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, description, children }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-50 shrink-0">
          <Icon className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function TagInput({
  tags, onAdd, onRemove, placeholder, inputValue, setInputValue,
}: {
  tags: string[]
  onAdd: (v: string) => void
  onRemove: (v: string) => void
  placeholder: string
  inputValue: string
  setInputValue: (v: string) => void
}) {
  return (
    <div className="space-y-3">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium">
              {tag}
              <button onClick={() => onRemove(tag)} className="hover:text-indigo-900 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue.trim()) {
              onAdd(inputValue)
              setInputValue("")
            }
          }}
          className="rounded-xl border-gray-200 text-sm h-9 focus:border-indigo-400 focus:ring-indigo-100"
        />
        <button
          onClick={() => { if (inputValue.trim()) { onAdd(inputValue); setInputValue("") } }}
          className="px-3 h-9 rounded-xl border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}

export function SettingsClient({ initialData }: { initialData: SettingsData }) {
  const [data, setData] = useState(initialData)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newLocation, setNewLocation] = useState("")

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          current_role: data.currentRole,
          experience_level: data.experienceLevel,
          skills: data.skills,
          preferred_job_titles: data.preferredJobTitles,
          preferred_locations: data.preferredLocations,
          remote_work_preferred: data.remoteWorkPreferred,
          job_types: data.jobTypes,
        }),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    } catch (e) {
      console.error("Save failed:", e)
    } finally {
      setSaving(false)
    }
  }, [data])

  const addTag = (field: "skills" | "preferredJobTitles" | "preferredLocations", value: string) => {
    const trimmed = value.trim()
    if (!trimmed || data[field].includes(trimmed)) return
    setData((prev) => ({ ...prev, [field]: [...prev[field], trimmed] }))
  }
  const removeTag = (field: "skills" | "preferredJobTitles" | "preferredLocations", value: string) => {
    setData((prev) => ({ ...prev, [field]: prev[field].filter((v) => v !== value) }))
  }
  const toggleJobType = (typeId: string) => {
    setData((prev) => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(typeId)
        ? prev.jobTypes.filter((t) => t !== typeId)
        : [...prev.jobTypes, typeId],
    }))
  }

  const inputClass = "rounded-xl border-gray-200 text-sm h-9 focus:border-indigo-400 focus:ring-indigo-100"

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile and job search preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors cursor-pointer shadow-sm shadow-indigo-200"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" />
            : saved ? <CheckCircle2 className="h-4 w-4" />
            : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile" description="Your basic information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Full Name</Label>
            <Input className={inputClass} value={data.name}
              onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Email</Label>
            <Input className={inputClass + " bg-gray-50"} value={data.email} disabled />
          </div>
        </div>
      </Section>

      {/* Saved job preferences (read-only snapshot of DB / onboarding) */}
      <Section
        icon={SlidersHorizontal}
        title="Job search preferences"
        description="What we use to match jobs and format your outreach — from your saved profile"
      >
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 sm:px-5 -mx-1">
          <PreferenceRow label="Job type">
            {formatJobTypeLabels(data.jobTypes).length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {formatJobTypeLabels(data.jobTypes).map((t) => (
                  <span
                    key={t}
                    className="inline-flex px-2.5 py-0.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-medium shadow-sm"
                  >
                    {t}
                  </span>
                ))}
                {data.remoteWorkPreferred && (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium">
                    Remote preferred
                  </span>
                )}
              </div>
            ) : data.remoteWorkPreferred ? (
              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium">
                Remote preferred
              </span>
            ) : (
              <span className="text-gray-400">Not set</span>
            )}
          </PreferenceRow>

          <PreferenceRow label="Job keywords">
            {data.skills.length > 0 ? (
              <p className="text-gray-900 leading-relaxed">{data.skills.join(", ")}</p>
            ) : (
              <span className="text-gray-400">Not set</span>
            )}
          </PreferenceRow>

      

          <PreferenceRow label="Years of experience">
            <span className="font-medium text-gray-900">{formatExperienceLabel(data.experienceLevel)}</span>
          </PreferenceRow>

          <PreferenceRow label="Resume uploaded">
            {data.resumeUploaded ? (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-800">Yes</p>
                  {data.latestResumeFileName && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-full" title={data.latestResumeFileName}>
                      {data.latestResumeFileName}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-gray-400">Not uploaded yet</span>
            )}
          </PreferenceRow>

          <PreferenceRow label="Email format">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="font-medium">{formatEmailFormatPreview(data.emailTemplateConfig)}</span>
            </div>
          </PreferenceRow>

          {data.preferredLocations.length > 0 && (
            <PreferenceRow label="Locations">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-gray-900 leading-relaxed">{data.preferredLocations.join(", ")}</p>
              </div>
            </PreferenceRow>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Update these anytime with <strong>Save Changes</strong> after editing profile fields (when available), or complete onboarding / dashboard preference flows — this panel refreshes on reload.
        </p>
      </Section>

      {/* Account */}
      <Section icon={Shield} title="Account" description="Integrations and account status">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Mail, label: "Gmail", connected: data.gmailConnected },
              { icon: CheckCircle2, label: "Resume", connected: data.resumeUploaded },
              { icon: Wrench, label: "Extension", connected: data.extensionInstalled },
            ].map(({ icon: Icon, label, connected }) => (
              <div key={label} className={`flex items-center gap-3 p-3.5 rounded-xl border ${connected ? 'border-emerald-100 bg-emerald-50/50' : 'border-gray-100 bg-gray-50/50'}`}>
                <div className={`p-2 rounded-lg ${connected ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  <Icon className={`h-4 w-4 ${connected ? 'text-emerald-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{label}</p>
                  <p className={`text-[11px] font-medium ${connected ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {connected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            Member since {new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </Section>

      {/* Bottom save */}
      <div className="flex justify-end pb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors cursor-pointer shadow-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" />
            : saved ? <CheckCircle2 className="h-4 w-4" />
            : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  )
}
