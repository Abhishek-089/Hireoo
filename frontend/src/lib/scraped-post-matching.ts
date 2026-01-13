import { prisma } from './prisma'

export interface ScrapedPostMatchResult {
  scrapedPostId: string
  matchScore: number
  matchQuality: 'good' | 'medium' | 'bad'
  matchedAt: Date
}

export class ScrapedPostMatchingService {
  /**
   * Match a scraped post to a user based on simple criteria
   * This is a simplified matching - you can enhance it with AI embeddings later
   */
  static async matchScrapedPostToUser(
    scrapedPostId: string,
    userId: string
  ): Promise<ScrapedPostMatchResult | null> {
    try {
      // Get scraped post and user data
      const [post, user] = await Promise.all([
        prisma.scrapedPost.findUnique({
          where: { id: scrapedPostId },
          select: { id: true, text: true, user_id: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            skills: true,
            preferred_job_titles: true,
            preferred_locations: true,
            remote_work_preferred: true,
            job_types: true,
            experience_level: true,
          },
        }),
      ])

      if (!post || !user) {
        return null
      }

      // Simple matching logic based on keywords
      const postText = post.text.toLowerCase()
      let matchScore = 0

      // Check skill matches (40% weight)
      if (user.skills && user.skills.length > 0) {
        const matchingSkills = user.skills.filter((skill) =>
          postText.includes(skill.toLowerCase())
        )
        const skillScore = (matchingSkills.length / user.skills.length) * 40
        matchScore += skillScore
      }

      // Check job title matches (30% weight)
      if (user.preferred_job_titles && user.preferred_job_titles.length > 0) {
        const matchingTitles = user.preferred_job_titles.filter((title) =>
          postText.includes(title.toLowerCase())
        )
        if (matchingTitles.length > 0) {
          matchScore += 30
        }
      }

      // Check location matches (15% weight)
      if (user.preferred_locations && user.preferred_locations.length > 0) {
        const matchingLocations = user.preferred_locations.filter((location) =>
          postText.includes(location.toLowerCase())
        )
        if (matchingLocations.length > 0) {
          matchScore += 15
        } else if (user.remote_work_preferred && postText.includes('remote')) {
          matchScore += 15
        }
      }

      // Check job type matches (10% weight)
      if (user.job_types && user.job_types.length > 0) {
        const matchingTypes = user.job_types.filter((type) =>
          postText.includes(type.toLowerCase())
        )
        if (matchingTypes.length > 0) {
          matchScore += 10
        }
      }

      // Check for email address (5% bonus if present)
      const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g
      if (emailRegex.test(postText)) {
        matchScore += 5
      }

      // Determine match quality
      let matchQuality: 'good' | 'medium' | 'bad'
      if (matchScore >= 50) {
        matchQuality = 'good'
      } else if (matchScore >= 25) {
        matchQuality = 'medium'
      } else {
        matchQuality = 'bad'
      }

      // Only create match if score is above threshold (e.g., 20)
      if (matchScore < 20) {
        return null
      }

      // Save match to database
      const match = await prisma.scrapedPostMatch.upsert({
        where: {
          user_id_scraped_post_id: {
            user_id: userId,
            scraped_post_id: scrapedPostId,
          },
        },
        update: {
          match_score: matchScore,
          match_quality: matchQuality,
          matched_at: new Date(),
        },
        create: {
          user_id: userId,
          scraped_post_id: scrapedPostId,
          match_score: matchScore,
          match_quality: matchQuality,
          matched_at: new Date(),
        },
      })

      return {
        scrapedPostId: match.scraped_post_id,
        matchScore: match.match_score,
        matchQuality: match.match_quality as 'good' | 'medium' | 'bad',
        matchedAt: match.matched_at,
      }
    } catch (error) {
      console.error('Error matching scraped post to user:', error)
      return null
    }
  }

  /**
   * Match all scraped posts for a user
   */
  static async matchAllScrapedPostsForUser(userId: string): Promise<{
    total: number
    matched: number
    good: number
    medium: number
    bad: number
  }> {
    try {
      const posts = await prisma.scrapedPost.findMany({
        where: { user_id: userId },
        select: { id: true },
      })

      let matched = 0
      let good = 0
      let medium = 0
      let bad = 0

      for (const post of posts) {
        const result = await this.matchScrapedPostToUser(post.id, userId)
        if (result) {
          matched++
          if (result.matchQuality === 'good') good++
          else if (result.matchQuality === 'medium') medium++
          else bad++
        }
      }

      return {
        total: posts.length,
        matched,
        good,
        medium,
        bad,
      }
    } catch (error) {
      console.error('Error matching all scraped posts:', error)
      throw error
    }
  }

  /**
   * Mark a scraped post as shown to user
   */
  static async markPostAsShown(
    scrapedPostId: string,
    userId: string
  ): Promise<void> {
    try {
      await prisma.scrapedPostMatch.updateMany({
        where: {
          scraped_post_id: scrapedPostId,
          user_id: userId,
          shown_to_user: false,
        },
        data: {
          shown_to_user: true,
          shown_at: new Date(),
        },
      })
    } catch (error) {
      console.error('Error marking post as shown:', error)
    }
  }

  /**
   * Get match statistics for a user
   */
  static async getMatchStats(userId: string): Promise<{
    totalScraped: number
    totalMatched: number
    totalShown: number
    totalApplied: number
    goodMatches: number
    mediumMatches: number
    badMatches: number
  }> {
    try {
      const [totalScraped, matches] = await Promise.all([
        prisma.scrapedPost.count({
          where: { user_id: userId },
        }),
        prisma.scrapedPostMatch.findMany({
          where: { user_id: userId },
          select: {
            match_quality: true,
            shown_to_user: true,
            applied: true,
          },
        }),
      ])

      const totalMatched = matches.length
      const totalShown = matches.filter((m: any) => m.shown_to_user).length
      const totalApplied = matches.filter((m: any) => m.applied).length
      const goodMatches = matches.filter((m: any) => m.match_quality === 'good').length
      const mediumMatches = matches.filter((m: any) => m.match_quality === 'medium').length
      const badMatches = matches.filter((m: any) => m.match_quality === 'bad').length

      return {
        totalScraped,
        totalMatched,
        totalShown,
        totalApplied,
        goodMatches,
        mediumMatches,
        badMatches,
      }
    } catch (error) {
      console.error('Error getting match stats:', error)
      throw error
    }
  }
}






