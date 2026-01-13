"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Plus, MapPin } from "lucide-react"

interface JobPreferencesStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const PREDEFINED_JOB_TITLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Product Manager", "UX Designer", "UI Designer", "DevOps Engineer",
  "Data Scientist", "Data Engineer", "Machine Learning Engineer", "Data Analyst",
  "Marketing Manager", "Content Writer", "SEO Specialist", "Sales Representative",
  "Business Analyst", "Project Manager", "QA Engineer", "Technical Writer"
]

const MAJOR_CITIES = [
  "San Francisco", "New York", "Los Angeles", "Seattle", "Austin", "Boston",
  "Chicago", "Denver", "Miami", "Atlanta", "Dallas", "Phoenix"
]

const JOB_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract/Freelance" },
  { id: "internship", label: "Internship" },
  { id: "remote", label: "Remote work only" }
]

export function JobPreferencesStep({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: JobPreferencesStepProps) {
  const [formData, setFormData] = useState({
    preferredJobTitles: data?.preferredJobTitles || [],
    preferredLocations: data?.preferredLocations || [],
    remoteWorkPreferred: data?.remoteWorkPreferred || false,
    jobTypes: data?.jobTypes || [],
    customJobTitle: "",
    customLocation: "",
  })

  const handleJobTitleSelect = (title: string) => {
    if (!formData.preferredJobTitles.includes(title)) {
      setFormData(prev => ({
        ...prev,
        preferredJobTitles: [...prev.preferredJobTitles, title]
      }))
    }
  }

  const handleJobTitleRemove = (title: string) => {
    setFormData(prev => ({
      ...prev,
      preferredJobTitles: prev.preferredJobTitles.filter((t: string) => t !== title)
    }))
  }

  const handleAddCustomJobTitle = () => {
    if (formData.customJobTitle.trim() && !formData.preferredJobTitles.includes(formData.customJobTitle.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredJobTitles: [...prev.preferredJobTitles, formData.customJobTitle.trim()],
        customJobTitle: ""
      }))
    }
  }

  const handleLocationSelect = (location: string) => {
    if (!formData.preferredLocations.includes(location)) {
      setFormData(prev => ({
        ...prev,
        preferredLocations: [...prev.preferredLocations, location]
      }))
    }
  }

  const handleLocationRemove = (location: string) => {
    setFormData(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.filter((l: string) => l !== location)
    }))
  }

  const handleAddCustomLocation = () => {
    if (formData.customLocation.trim() && !formData.preferredLocations.includes(formData.customLocation.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredLocations: [...prev.preferredLocations, formData.customLocation.trim()],
        customLocation: ""
      }))
    }
  }

  const handleJobTypeToggle = (jobTypeId: string) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobTypeId)
        ? prev.jobTypes.filter((id: string) => id !== jobTypeId)
        : [...prev.jobTypes, jobTypeId]
    }))
  }

  const handleNext = () => {
    onNext(formData)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What kind of roles are you looking for?</h2>
        <p className="text-gray-600">
          Help us find the perfect job opportunities for you
        </p>
      </div>

      {/* Preferred Job Titles */}
      <div className="max-w-2xl mx-auto">
        <Label className="text-lg font-medium text-gray-900 mb-4 block">
          Preferred Job Titles
        </Label>

        {/* Selected Job Titles */}
        {formData.preferredJobTitles.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {formData.preferredJobTitles.map((title: string) => (
                <Badge key={title} variant="secondary" className="px-3 py-1">
                  {title}
                  <button
                    onClick={() => handleJobTitleRemove(title)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Job Title */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a custom job title..."
            value={formData.customJobTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, customJobTitle: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomJobTitle()}
          />
          <Button onClick={handleAddCustomJobTitle} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Popular Job Titles */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PREDEFINED_JOB_TITLES.filter(title => !formData.preferredJobTitles.includes(title)).slice(0, 12).map((title: string) => (
            <button
              key={title}
              onClick={() => handleJobTitleSelect(title)}
              className="px-3 py-2 text-left text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Locations */}
      <div className="max-w-2xl mx-auto">
        <Label className="text-lg font-medium text-gray-900 mb-4 block">
          Preferred Locations
        </Label>

        {/* Selected Locations */}
        {formData.preferredLocations.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {formData.preferredLocations.map((location: string) => (
                <Badge key={location} variant="secondary" className="px-3 py-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {location}
                  <button
                    onClick={() => handleLocationRemove(location)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Location */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a custom location..."
            value={formData.customLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, customLocation: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomLocation()}
          />
          <Button onClick={handleAddCustomLocation} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Popular Cities */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MAJOR_CITIES.filter(city => !formData.preferredLocations.includes(city)).map((city: string) => (
            <button
              key={city}
              onClick={() => handleLocationSelect(city)}
              className="px-3 py-2 text-left text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors flex items-center"
            >
              <MapPin className="h-3 w-3 mr-2" />
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Remote Work Preference */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={formData.remoteWorkPreferred}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, remoteWorkPreferred: !!checked }))
            }
          />
          <Label htmlFor="remote" className="text-gray-900">
            I prefer remote work opportunities
          </Label>
        </div>
      </div>

      {/* Job Types */}
      <div className="max-w-2xl mx-auto">
        <Label className="text-lg font-medium text-gray-900 mb-4 block">
          Job Types
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {JOB_TYPES.map((jobType) => (
            <div key={jobType.id} className="flex items-center space-x-2">
              <Checkbox
                id={jobType.id}
                checked={formData.jobTypes.includes(jobType.id)}
                onCheckedChange={() => handleJobTypeToggle(jobType.id)}
              />
              <Label htmlFor={jobType.id} className="text-gray-900">
                {jobType.label}
              </Label>
            </div>
          ))}
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
