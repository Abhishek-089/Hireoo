"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface SkillsStepProps {
  data: any
  onNext: (data: any) => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const PREDEFINED_SKILLS = [
  // Technical Skills
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust",
  "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express.js",
  "HTML", "CSS", "Sass", "Tailwind CSS",
  "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "AWS", "Docker", "Kubernetes", "Git",
  "REST APIs", "GraphQL", "WebSockets",

  // Design Skills
  "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator",
  "UI/UX Design", "User Research", "Prototyping",

  // Business Skills
  "Project Management", "Agile", "Scrum", "Kanban",
  "Data Analysis", "Excel", "Tableau", "Power BI",
  "Marketing", "SEO", "Content Writing", "Sales",

  // Soft Skills
  "Leadership", "Communication", "Problem Solving", "Teamwork",
  "Time Management", "Adaptability", "Creativity"
]

export function SkillsStep({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: SkillsStepProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(data || [])
  const [customSkill, setCustomSkill] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSkills = PREDEFINED_SKILLS.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSkills.includes(skill)
  )

  const handleSkillSelect = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  const handleSkillRemove = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill))
  }

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()])
      setCustomSkill("")
    }
  }

  const handleNext = () => {
    onNext(selectedSkills)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What are your skills?</h2>
        <p className="text-gray-600">
          Select your technical and professional skills to help us find better matches
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Skills</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="px-3 py-1">
                {skill}
                <button
                  onClick={() => handleSkillRemove(skill)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Skill */}
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a custom skill..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button onClick={handleAddCustomSkill} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Available Skills */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Popular Skills</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
          {filteredSkills.slice(0, 40).map((skill) => (
            <button
              key={skill}
              onClick={() => handleSkillSelect(skill)}
              className="px-3 py-2 text-left text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              {skill}
            </button>
          ))}
        </div>
        {filteredSkills.length === 0 && searchTerm && (
          <p className="text-gray-500 text-center py-4">No skills found matching "{searchTerm}"</p>
        )}
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
