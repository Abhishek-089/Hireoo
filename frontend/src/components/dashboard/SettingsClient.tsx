"use client"

import { useState, useCallback } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Briefcase,
  MapPin,
  X,
  Plus,
  Save,
  CheckCircle2,
  Loader2,
  LogOut,
  Mail,
  Shield,
  Wrench,
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
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "junior", label: "Junior (2-4 years)" },
  { value: "mid", label: "Mid-Level (4-7 years)" },
  { value: "senior", label: "Senior (7-10 years)" },
  { value: "lead", label: "Lead/Principal (10+ years)" },
  { value: "executive", label: "Executive/C-Suite" },
]

const JOB_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract/Freelance" },
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
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
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

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-500">
            Manage your profile and job preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </Button>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Your basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={data.email} disabled className="bg-gray-50" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Current Role</Label>
              <Input
                id="role"
                value={data.currentRole}
                onChange={(e) => setData((p) => ({ ...p, currentRole: e.target.value }))}
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                value={data.experienceLevel}
                onValueChange={(v) => setData((p) => ({ ...p, experienceLevel: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-gray-500" />
            <CardTitle>Skills</CardTitle>
          </div>
          <CardDescription>
            Your technical and professional skills. These are used to match you with relevant jobs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                  {skill}
                  <button
                    onClick={() => removeTag("skills", skill)}
                    className="ml-1 rounded-full p-0.5 hover:bg-gray-300/50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTag("skills", newSkill)
                  setNewSkill("")
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                addTag("skills", newSkill)
                setNewSkill("")
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.filter((s) => !data.skills.includes(s))
                .slice(0, 15)
                .map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addTag("skills", skill)}
                    className="px-2.5 py-1 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-md border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Preferences Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-500" />
            <CardTitle>Job Preferences</CardTitle>
          </div>
          <CardDescription>
            What kind of roles and locations you're looking for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Titles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preferred Job Titles</Label>
            {data.preferredJobTitles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.preferredJobTitles.map((title) => (
                  <Badge key={title} variant="secondary" className="gap-1 pr-1">
                    {title}
                    <button
                      onClick={() => removeTag("preferredJobTitles", title)}
                      className="ml-1 rounded-full p-0.5 hover:bg-gray-300/50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Add a job title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTag("preferredJobTitles", newTitle)
                    setNewTitle("")
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addTag("preferredJobTitles", newTitle)
                  setNewTitle("")
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_JOB_TITLES.filter((t) => !data.preferredJobTitles.includes(t))
                .slice(0, 8)
                .map((title) => (
                  <button
                    key={title}
                    onClick={() => addTag("preferredJobTitles", title)}
                    className="px-2.5 py-1 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-md border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    + {title}
                  </button>
                ))}
            </div>
          </div>

          {/* Preferred Locations */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preferred Locations</Label>
            {data.preferredLocations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.preferredLocations.map((loc) => (
                  <Badge key={loc} variant="secondary" className="gap-1 pr-1">
                    <MapPin className="h-3 w-3" />
                    {loc}
                    <button
                      onClick={() => removeTag("preferredLocations", loc)}
                      className="ml-1 rounded-full p-0.5 hover:bg-gray-300/50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Add a location..."
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTag("preferredLocations", newLocation)
                    setNewLocation("")
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addTag("preferredLocations", newLocation)
                  setNewLocation("")
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="remote-pref"
                checked={data.remoteWorkPreferred}
                onCheckedChange={(checked) =>
                  setData((p) => ({ ...p, remoteWorkPreferred: !!checked }))
                }
              />
              <Label htmlFor="remote-pref" className="text-sm text-gray-700 cursor-pointer">
                I prefer remote work opportunities
              </Label>
            </div>
          </div>

          {/* Job Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Job Types</Label>
            <div className="flex flex-wrap gap-4">
              {JOB_TYPES.map((type) => (
                <div key={type.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`jt-${type.id}`}
                    checked={data.jobTypes.includes(type.id)}
                    onCheckedChange={() => toggleJobType(type.id)}
                  />
                  <Label htmlFor={`jt-${type.id}`} className="text-sm text-gray-700 cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>Account status and integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
              <Mail className={`h-5 w-5 ${data.gmailConnected ? "text-green-600" : "text-gray-400"}`} />
              <div>
                <p className="text-sm font-medium text-gray-900">Gmail</p>
                <p className="text-xs text-gray-500">
                  {data.gmailConnected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
              <CheckCircle2
                className={`h-5 w-5 ${data.resumeUploaded ? "text-green-600" : "text-gray-400"}`}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Resume</p>
                <p className="text-xs text-gray-500">
                  {data.resumeUploaded ? "Uploaded" : "Not uploaded"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
              <Wrench
                className={`h-5 w-5 ${data.extensionInstalled ? "text-green-600" : "text-gray-400"}`}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Extension</p>
                <p className="text-xs text-gray-500">
                  {data.extensionInstalled ? "Installed" : "Not installed"}
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 pt-2">
            Member since {new Date(data.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Bar */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
