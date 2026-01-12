"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BasicInfoStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export function BasicInfoStep({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: BasicInfoStepProps) {
  const [formData, setFormData] = useState({
    name: data?.name || "",
    currentRole: data?.currentRole || "",
    experienceLevel: data?.experienceLevel || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.currentRole.trim()) {
      newErrors.currentRole = "Current role is required"
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = "Experience level is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData)
    }
  }

  const experienceLevels = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "junior", label: "Junior (2-4 years)" },
    { value: "mid", label: "Mid-Level (4-7 years)" },
    { value: "senior", label: "Senior (7-10 years)" },
    { value: "lead", label: "Lead/Principal (10+ years)" },
    { value: "executive", label: "Executive/C-Suite" },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
        <p className="text-gray-600">
          This helps us personalize your job recommendations
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        {/* Name */}
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Current Role */}
        <div>
          <Label htmlFor="currentRole">Current or Most Recent Role</Label>
          <Input
            id="currentRole"
            type="text"
            placeholder="e.g. Software Engineer, Product Manager"
            value={formData.currentRole}
            onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
            className={errors.currentRole ? "border-red-500" : ""}
          />
          {errors.currentRole && (
            <p className="text-red-500 text-sm mt-1">{errors.currentRole}</p>
          )}
        </div>

        {/* Experience Level */}
        <div>
          <Label htmlFor="experienceLevel">Experience Level</Label>
          <Select
            value={formData.experienceLevel}
            onValueChange={(value) =>
              setFormData(prev => ({ ...prev, experienceLevel: value }))
            }
          >
            <SelectTrigger className={errors.experienceLevel ? "border-red-500" : ""}>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.experienceLevel && (
            <p className="text-red-500 text-sm mt-1">{errors.experienceLevel}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep}
        >
          Back
        </Button>
        <Button onClick={handleNext}>
          {isLastStep ? "Complete Setup" : "Next"}
        </Button>
      </div>
    </div>
  )
}
