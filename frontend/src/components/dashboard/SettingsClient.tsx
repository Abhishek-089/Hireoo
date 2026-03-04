"use client"

import { useState, useCallback } from "react"
import { signOut } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  User, Briefcase, MapPin, X, Plus, Save, CheckCircle2,
  Loader2, LogOut, Mail, Shield, Wrench,
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
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Current Role</Label>
            <Input className={inputClass} value={data.currentRole}
              onChange={(e) => setData((p) => ({ ...p, currentRole: e.target.value }))} placeholder="e.g. Software Engineer" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Experience Level</Label>
            <Select value={data.experienceLevel} onValueChange={(v) => setData((p) => ({ ...p, experienceLevel: v }))}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Skills */}
      <Section icon={Wrench} title="Skills" description="Used to match you with relevant jobs">
        <div className="space-y-4">
          <TagInput
            tags={data.skills} placeholder="Add a skill…"
            inputValue={newSkill} setInputValue={setNewSkill}
            onAdd={(v) => { addTag("skills", v); setNewSkill("") }}
            onRemove={(v) => removeTag("skills", v)}
          />
          <div>
            <p className="text-xs text-gray-400 mb-2">Quick add</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.filter((s) => !data.skills.includes(s)).slice(0, 16).map((skill) => (
                <button key={skill} onClick={() => addTag("skills", skill)}
                  className="px-2.5 py-1 text-xs rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors cursor-pointer">
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Job Preferences */}
      <Section icon={Briefcase} title="Job Preferences" description="Roles and locations you're targeting">
        <div className="space-y-6">

          {/* Titles */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-700">Preferred Job Titles</p>
            <TagInput
              tags={data.preferredJobTitles} placeholder="Add a job title…"
              inputValue={newTitle} setInputValue={setNewTitle}
              onAdd={(v) => { addTag("preferredJobTitles", v); setNewTitle("") }}
              onRemove={(v) => removeTag("preferredJobTitles", v)}
            />
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_JOB_TITLES.filter((t) => !data.preferredJobTitles.includes(t)).slice(0, 8).map((title) => (
                <button key={title} onClick={() => addTag("preferredJobTitles", title)}
                  className="px-2.5 py-1 text-xs rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors cursor-pointer">
                  + {title}
                </button>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-700">Preferred Locations</p>
            <TagInput
              tags={data.preferredLocations} placeholder="Add a city or country…"
              inputValue={newLocation} setInputValue={setNewLocation}
              onAdd={(v) => { addTag("preferredLocations", v); setNewLocation("") }}
              onRemove={(v) => removeTag("preferredLocations", v)}
            />
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => setData((p) => ({ ...p, remoteWorkPreferred: !p.remoteWorkPreferred }))}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${data.remoteWorkPreferred ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <div className={`mt-0.5 ml-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${data.remoteWorkPreferred ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-xs text-gray-600 group-hover:text-gray-900">I prefer remote work</span>
            </label>
          </div>

          {/* Job types */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-700">Job Types</p>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => {
                const active = data.jobTypes.includes(type.id)
                return (
                  <button key={type.id} onClick={() => toggleJobType(type.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}>
                    {type.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
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
