"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, X, Search, Briefcase, Calendar, Clock } from "lucide-react"

interface SearchInfoStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

// Experience options
const EXPERIENCE_LEVELS = [
  { value: "0-1", label: "0-1 Years (Entry)" },
  { value: "1-3", label: "1-3 Years (Junior)" },
  { value: "3-5", label: "3-5 Years (Mid-Level)" },
  { value: "5-10", label: "5-10 Years (Senior)" },
  { value: "10+", label: "10+ Years (Lead/Architect)" },
]

// Date posted options
// Date posted options (LinkedIn compatible values)
const DATE_POSTED_OPTIONS = [
  { value: "r86400", label: "Past 24 hours" },
  { value: "r604800", label: "Past week" },
  { value: "r2592000", label: "Past month" },
]

export function SearchInfoStep({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: SearchInfoStepProps) {
  // Form State
  const [formData, setFormData] = useState({
    jobKeywords: data?.jobKeywords || [],
    experienceLevel: data?.experienceLevel || "",
    datePosted: data?.datePosted || "r604800",
    resume: data?.resume || null,
  })

  // Resume upload state
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Resume Handlers

  // Resume Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
  
        if (!allowedTypes.includes(file.type)) {
          setError("Please select a PDF or Word document (.doc, .docx)")
          return
        }
  
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError("File size must be less than 10MB")
          return
        }
  
        // In a real app, we might upload immediately or just store the file object to upload on "Next"
        // For this refactor, let's simulate the state update and assume upload happens on next or separately.
        // If reusing the previous logic:
        uploadResume(file)
    }
  }

  const uploadResume = async (file: File) => {
      setUploading(true)
      setError("")
      try {
        const formData = new FormData()
        formData.append("file", file)
  
        const res = await fetch("/api/upload/resume", {
          method: "POST",
          body: formData,
        })
  
        const data = await res.json()
  
        if (!res.ok) {
          setError(data.error || "Upload failed. Please try again.")
          setUploading(false)
          return
        }

        // Success
        setFormData(prev => ({
            ...prev,
            resume: {
                fileUrl: data.url,
                fileName: file.name,
                uploaded: true
            }
        }))
      } catch (error) {
        setError("Upload failed. Place try again.")
        console.error(error)
      } finally {
        setUploading(false)
      }
  }

  const handleRemoveResume = () => {
      setFormData(prev => ({ ...prev, resume: null }))
      if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleNext = () => {
      // Basic validation
      if (formData.jobKeywords.length === 0) {
          // Ideally show error, for now just return or alert
          // alert("Please add at least one job keyword")
          return
      }
      onNext(formData)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Job Keywords section */}
      <div className="space-y-4">
        <Label className="text-lg font-medium text-gray-900 flex items-center gap-2">
           <Search className="w-5 h-5 text-blue-600" />
           Job Keyword
        </Label>
        <div className="relative">
            <Input 
                placeholder="e.g. Frontend Developer" 
                value={formData.jobKeywords[0] || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, jobKeywords: e.target.value ? [e.target.value] : [] }))}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Experience Level */}
        <div className="space-y-4">
            <Label className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Years of Experience
            </Label>
            <Select 
                value={formData.experienceLevel} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, experienceLevel: val }))}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select experience..." />
                </SelectTrigger>
                <SelectContent>
                    {EXPERIENCE_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* 3. Date Posted Filter */}
        <div className="space-y-4">
            <Label className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Date Posted
            </Label>
             <Select 
                value={formData.datePosted} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, datePosted: val }))}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select date range..." />
                </SelectTrigger>
                <SelectContent>
                    {DATE_POSTED_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* 4. Resume Upload (Simplified & Integrated) */}
      <div className="space-y-4">
        <Label className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Resume Upload
        </Label>
        
        {!formData.resume ? (
            <div 
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 transition-all hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer group text-center"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                </div>
                <p className="text-gray-900 font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">PDF or DOCX (max 10MB)</p>
                {uploading && <p className="text-sm text-blue-600 mt-2 font-medium">Uploading...</p>}
            </div>
        ) : (
             <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{formData.resume.fileName}</p>
                        <p className="text-xs text-green-600 font-medium">Uploaded Successfully</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={handleRemoveResume}>
                    <X className="w-5 h-5" />
                </Button>
            </div>
        )}
         <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Footer / Navigation */}
      <div className="pt-6 flex justify-end">
          <Button 
            size="lg" 
            onClick={handleNext} 
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-600/20"
            disabled={formData.jobKeywords.length === 0}
          >
            Next Step
          </Button>
      </div>

    </div>
  )
}
