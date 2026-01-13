import { prisma } from './prisma'
import { EmbeddingsService } from './embeddings'
import { StructuredMatchingService, UserProfile, JobData } from './structured-matching'

export interface MatchResult {
  userId: string
  jobId: string
  embeddingSimilarity: number
  skillOverlapScore: number
  experienceFitScore: number
  locationFitScore: number
  jobTypeFitScore: number
  finalScore: number
  matchQuality: 'good' | 'medium' | 'bad'
}

export class JobMatchingService {
  // Weight factors for combining different scores
  private static readonly WEIGHTS = {
    EMBEDDING: 0.4,    // 40% - semantic similarity
    SKILLS: 0.3,       // 30% - skill overlap
    EXPERIENCE: 0.15,  // 15% - experience fit
    LOCATION: 0.1,     // 10% - location fit
    JOB_TYPE: 0.05,    // 5% - job type fit
  }

  // Quality thresholds
  private static readonly QUALITY_THRESHOLDS = {
    GOOD: 75,    // 75-100: Good match
    MEDIUM: 50,  // 50-74: Medium match
    BAD: 0,      // 0-49: Bad match
  }

  /**
   * Match a single job to all eligible users
   */
  static async matchJobToUsers(jobId: string): Promise<MatchResult[]> {
    try {
      console.log(`Starting job matching for job: ${jobId}`)

      // Get job data
      const jobData = await StructuredMatchingService.getJobData(jobId)

      // Get all users who have completed onboarding
      const users = await prisma.user.findMany({
        where: {
          onboarding_step: { gte: 7 }, // Completed onboarding
        },
        select: {
          id: true,
        },
      })

      console.log(`Found ${users.length} eligible users for matching`)

      const matchResults: MatchResult[] = []

      for (const user of users) {
        try {
          const matchResult = await this.matchJobToUser(jobData, user.id)
          matchResults.push(matchResult)
        } catch (error) {
          console.error(`Error matching job ${jobId} to user ${user.id}:`, error)
          // Continue with other users
        }
      }

      // Sort by final score (highest first)
      matchResults.sort((a, b) => b.finalScore - a.finalScore)

      // Save matches to database
      await this.saveMatchesToDatabase(matchResults)

      console.log(`Completed matching job ${jobId} to ${matchResults.length} users`)

      return matchResults
    } catch (error) {
      console.error(`Error in matchJobToUsers for job ${jobId}:`, error)
      throw error
    }
  }

  /**
   * Match a single job to a single user
   */
  static async matchJobToUser(jobData: JobData, userId: string): Promise<MatchResult> {
    // Get user profile
    const userProfile = await StructuredMatchingService.getUserProfile(userId)

    // Calculate embedding similarity
    const embeddingSimilarity = await this.calculateEmbeddingSimilarity(jobData, userProfile)

    // Calculate structured scores
    const skillOverlapScore = StructuredMatchingService.calculateSkillOverlap(
      userProfile.skills,
      jobData.skills
    )

    const experienceFitScore = StructuredMatchingService.calculateExperienceFit(
      userProfile.experience_level,
      jobData.experience_level
    )

    const locationFitScore = StructuredMatchingService.calculateLocationFit(
      userProfile.preferred_locations,
      userProfile.remote_work_preferred,
      jobData.location
    )

    const jobTypeFitScore = StructuredMatchingService.calculateJobTypeFit(
      userProfile.job_types,
      jobData.job_type
    )

    // Calculate final score
    const finalScore = this.calculateFinalScore({
      embeddingSimilarity,
      skillOverlapScore,
      experienceFitScore,
      locationFitScore,
      jobTypeFitScore,
    })

    // Determine match quality
    const matchQuality = this.determineMatchQuality(finalScore)

    return {
      userId,
      jobId: jobData.id,
      embeddingSimilarity,
      skillOverlapScore,
      experienceFitScore,
      locationFitScore,
      jobTypeFitScore,
      finalScore,
      matchQuality,
    }
  }

  /**
   * Calculate embedding similarity between job and user profile
   */
  private static async calculateEmbeddingSimilarity(
    jobData: JobData,
    userProfile: UserProfile
  ): Promise<number> {
    try {
      // Create job text for embedding
      const jobText = this.createJobText(jobData)

      // Create user profile text for embedding
      const userProfileData = {
        skills: userProfile.skills,
        experience: userProfile.experience_level || '',
        currentRole: '', // Could be extracted from user data
        preferredJobTitles: userProfile.preferred_job_titles,
      }

      // Get embeddings
      const [jobEmbedding, userEmbedding] = await Promise.all([
        EmbeddingsService.createJobEmbedding(jobText),
        EmbeddingsService.createUserProfileEmbedding(userProfileData),
      ])

      // Calculate similarity
      const similarity = EmbeddingsService.calculateSimilarity(jobEmbedding, userEmbedding)

      return similarity
    } catch (error) {
      console.error('Error calculating embedding similarity:', error)
      return 0.0 // Return 0 on error
    }
  }

  /**
   * Calculate final combined score (0-100)
   */
  private static calculateFinalScore(scores: {
    embeddingSimilarity: number
    skillOverlapScore: number
    experienceFitScore: number
    locationFitScore: number
    jobTypeFitScore: number
  }): number {
    const weightedScore =
      scores.embeddingSimilarity * this.WEIGHTS.EMBEDDING +
      scores.skillOverlapScore * this.WEIGHTS.SKILLS +
      scores.experienceFitScore * this.WEIGHTS.EXPERIENCE +
      scores.locationFitScore * this.WEIGHTS.LOCATION +
      scores.jobTypeFitScore * this.WEIGHTS.JOB_TYPE

    // Convert to 0-100 scale
    return Math.round(weightedScore * 100)
  }

  /**
   * Determine match quality based on final score
   */
  private static determineMatchQuality(finalScore: number): 'good' | 'medium' | 'bad' {
    if (finalScore >= this.QUALITY_THRESHOLDS.GOOD) {
      return 'good'
    } else if (finalScore >= this.QUALITY_THRESHOLDS.MEDIUM) {
      return 'medium'
    } else {
      return 'bad'
    }
  }

  /**
   * Create job text for embedding
   */
  private static createJobText(jobData: JobData): string {
    const parts = []

    if (jobData.title) parts.push(`Job Title: ${jobData.title}`)
    if (jobData.company) parts.push(`Company: ${jobData.company}`)
    if (jobData.location) parts.push(`Location: ${jobData.location}`)
    if (jobData.skills.length > 0) parts.push(`Skills: ${jobData.skills.join(', ')}`)
    if (jobData.experience_level) parts.push(`Experience: ${jobData.experience_level}`)
    if (jobData.job_type) parts.push(`Job Type: ${jobData.job_type}`)

    return parts.join('. ')
  }

  /**
   * Save match results to database
   */
  private static async saveMatchesToDatabase(matchResults: MatchResult[]): Promise<void> {
    try {
      // Use transaction to ensure data consistency
      await prisma.$transaction(async (tx: any) => {
        for (const result of matchResults) {
          // Check if match already exists
          const existingMatch = await tx.jobMatch.findUnique({
            where: {
              user_id_job_id: {
                user_id: result.userId,
                job_id: result.jobId,
              },
            },
          })

          if (existingMatch) {
            // Update existing match
            await tx.jobMatch.update({
              where: { id: existingMatch.id },
              data: {
                embedding_similarity: result.embeddingSimilarity,
                skill_overlap_score: result.skillOverlapScore,
                experience_fit_score: result.experienceFitScore,
                location_fit_score: result.locationFitScore,
                final_score: result.finalScore,
                match_quality: result.matchQuality,
                matched_at: new Date(),
              },
            })
          } else {
            // Create new match
            await tx.jobMatch.create({
              data: {
                user_id: result.userId,
                job_id: result.jobId,
                embedding_similarity: result.embeddingSimilarity,
                skill_overlap_score: result.skillOverlapScore,
                experience_fit_score: result.experienceFitScore,
                location_fit_score: result.locationFitScore,
                final_score: result.finalScore,
                match_quality: result.matchQuality,
              },
            })
          }
        }
      })

      console.log(`Saved ${matchResults.length} match results to database`)
    } catch (error) {
      console.error('Error saving match results to database:', error)
      throw error
    }
  }

  /**
   * Get top matches for a user
   */
  static async getTopMatchesForUser(userId: string, limit: number = 10): Promise<any[]> {
    const matches = await prisma.jobMatch.findMany({
      where: { user_id: userId },
      orderBy: { final_score: 'desc' },
      take: limit,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            skills: true,
            salary_range: true,
            job_type: true,
            application_url: true,
            scraped_at: true,
          },
        },
      },
    })

    return matches.map(match => ({
      id: match.id,
      job: match.job,
      embeddingSimilarity: match.embedding_similarity,
      skillOverlapScore: match.skill_overlap_score,
      experienceFitScore: match.experience_fit_score,
      locationFitScore: match.location_fit_score,
      finalScore: match.final_score,
      matchQuality: match.match_quality,
      matchedAt: match.matched_at,
      applied: match.applied,
      appliedAt: match.applied_at,
      notes: match.notes,
    }))
  }

  /**
   * Update match application status
   */
  static async updateMatchApplication(matchId: string, applied: boolean, notes?: string): Promise<void> {
    await prisma.jobMatch.update({
      where: { id: matchId },
      data: {
        applied,
        applied_at: applied ? new Date() : null,
        notes,
      },
    })
  }
}


