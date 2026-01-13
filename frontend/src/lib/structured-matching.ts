import { prisma } from './prisma'

export interface UserProfile {
  id: string
  skills: string[]
  experience_level: string | null
  preferred_locations: string[]
  remote_work_preferred: boolean
  job_types: string[]
  preferred_job_titles: string[]
}

export interface JobData {
  id: string
  title: string | null
  company: string | null
  location: string | null
  skills: string[]
  experience_level: string | null
  job_type: string | null
}

export class StructuredMatchingService {
  /**
   * Calculate skill overlap score (0-1)
   */
  static calculateSkillOverlap(userSkills: string[], jobSkills: string[]): number {
    if (!userSkills.length || !jobSkills.length) {
      return 0
    }

    // Normalize skills to lowercase for matching
    const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase().trim())
    const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase().trim())

    // Find matching skills
    const matchingSkills = normalizedUserSkills.filter(userSkill =>
      normalizedJobSkills.some(jobSkill =>
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
      )
    )

    // Calculate overlap percentage
    const overlapScore = matchingSkills.length / Math.max(normalizedJobSkills.length, 1)

    return Math.min(overlapScore, 1.0)
  }

  /**
   * Calculate experience fit score (0-1)
   */
  static calculateExperienceFit(userExperience: string | null, jobExperience: string | null): number {
    if (!userExperience || !jobExperience) {
      return 0.5 // Neutral score when information is missing
    }

    const experienceLevels = {
      'entry': 1,
      'junior': 2,
      'mid': 3,
      'senior': 4,
      'lead': 5,
      'principal': 5,
      'executive': 6
    }

    const userLevel = this.extractExperienceLevel(userExperience)
    const jobLevel = this.extractExperienceLevel(jobExperience)

    if (!userLevel || !jobLevel) {
      return 0.5
    }

    const userScore = experienceLevels[userLevel as keyof typeof experienceLevels] || 3
    const jobScore = experienceLevels[jobLevel as keyof typeof experienceLevels] || 3

    // Calculate fit based on difference
    const difference = Math.abs(userScore - jobScore)

    // Perfect match (0 difference) = 1.0
    // 1 level difference = 0.7
    // 2+ levels difference = 0.3 or less
    if (difference === 0) return 1.0
    if (difference === 1) return 0.7
    if (difference === 2) return 0.4
    return 0.2
  }

  /**
   * Calculate location fit score (0-1)
   */
  static calculateLocationFit(
    userLocations: string[],
    userRemotePreferred: boolean,
    jobLocation: string | null
  ): number {
    // If user prefers remote work, give high score for any location
    if (userRemotePreferred) {
      return 0.9
    }

    if (!userLocations.length || !jobLocation) {
      return 0.5 // Neutral when location info is missing
    }

    const normalizedUserLocations = userLocations.map(loc => loc.toLowerCase().trim())
    const normalizedJobLocation = jobLocation.toLowerCase().trim()

    // Check for exact matches or partial matches
    for (const userLocation of normalizedUserLocations) {
      if (normalizedJobLocation.includes(userLocation) ||
        userLocation.includes(normalizedJobLocation)) {
        return 1.0 // Perfect location match
      }

      // Check for city/state matches
      if (this.isLocationMatch(userLocation, normalizedJobLocation)) {
        return 0.8 // Good location match
      }
    }

    return 0.2 // Poor location match
  }

  /**
   * Calculate job type fit score (0-1)
   */
  static calculateJobTypeFit(userJobTypes: string[], jobType: string | null): number {
    if (!userJobTypes.length || !jobType) {
      return 0.5 // Neutral when job type info is missing
    }

    const normalizedUserTypes = userJobTypes.map(type => type.toLowerCase().trim())
    const normalizedJobType = jobType.toLowerCase().trim()

    // Check if job type is in user's preferred types
    const isPreferred = normalizedUserTypes.some(userType =>
      normalizedJobType.includes(userType) || userType.includes(normalizedJobType)
    )

    return isPreferred ? 1.0 : 0.3
  }

  /**
   * Extract experience level from text
   */
  private static extractExperienceLevel(experienceText: string): string | null {
    const text = experienceText.toLowerCase()

    if (text.includes('entry') || text.includes('fresher')) return 'entry'
    if (text.includes('junior')) return 'junior'
    if (text.includes('mid') || text.includes('intermediate')) return 'mid'
    if (text.includes('senior')) return 'senior'
    if (text.includes('lead') || text.includes('principal')) return 'lead'
    if (text.includes('executive') || text.includes('director')) return 'executive'

    // Try to extract years of experience
    const yearsMatch = text.match(/(\d+)\+?\s*years?/i)
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1])
      if (years <= 2) return 'entry'
      if (years <= 4) return 'junior'
      if (years <= 7) return 'mid'
      if (years <= 10) return 'senior'
      return 'lead'
    }

    return null
  }

  /**
   * Check if two locations match (basic implementation)
   */
  private static isLocationMatch(location1: string, location2: string): boolean {
    // Simple location matching - can be enhanced with geocoding
    const cities = [
      'san francisco', 'new york', 'los angeles', 'chicago', 'houston',
      'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas',
      'san jose', 'austin', 'jacksonville', 'fort worth', 'columbus',
      'seattle', 'denver', 'boston', 'el paso', 'detroit'
    ]

    const states = [
      'california', 'new york', 'texas', 'florida', 'illinois',
      'pennsylvania', 'ohio', 'georgia', 'north carolina', 'michigan'
    ]

    const loc1 = location1.toLowerCase()
    const loc2 = location2.toLowerCase()

    // Check city matches
    for (const city of cities) {
      if ((loc1.includes(city) && loc2.includes(city))) {
        return true
      }
    }

    // Check state matches
    for (const state of states) {
      if ((loc1.includes(state) && loc2.includes(state))) {
        return true
      }
    }

    return false
  }

  /**
   * Get user profile data for matching
   */
  static async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        skills: true,
        experience_level: true,
        preferred_locations: true,
        remote_work_preferred: true,
        job_types: true,
        preferred_job_titles: true,
      },
    })

    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    return {
      id: user.id,
      skills: user.skills || [],
      experience_level: user.experience_level,
      preferred_locations: user.preferred_locations || [],
      remote_work_preferred: user.remote_work_preferred || false,
      job_types: user.job_types || [],
      preferred_job_titles: user.preferred_job_titles || [],
    }
  }

  /**
   * Get job data for matching
   */
  static async getJobData(jobId: string): Promise<JobData> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        skills: true,
        experience_level: true,
        job_type: true,
      },
    })

    if (!job) {
      throw new Error(`Job not found: ${jobId}`)
    }

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      skills: job.skills || [],
      experience_level: job.experience_level,
      job_type: job.job_type,
    }
  }
}


