import { prisma } from './prisma'
import { DailyLimitService } from './daily-limit-service'

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
          select: { id: true, text: true, post_url: true },
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

      // Check for email address
      const { extractEmails } = await import('./utils')
      const emails = extractEmails(postText)

      // HARD FILTER 1: post must contain at least one email address
      if (emails.length === 0) {
        console.log(`[Matching] Skipping post ${scrapedPostId} — no email found`)
        // Make sure it stays hidden if it somehow got shown_to_user: true
        await prisma.scrapedPostMatch.updateMany({
          where: { user_id: userId, scraped_post_id: scrapedPostId },
          data: { shown_to_user: false, shown_at: null },
        })
        return null
      }

      // Small bonus for having a contactable email
      matchScore += 5

      // Determine match quality
      let matchQuality: 'good' | 'medium' | 'bad'
      if (matchScore >= 50) {
        matchQuality = 'good'
      } else if (matchScore >= 25) {
        matchQuality = 'medium'
      } else {
        matchQuality = 'bad'
      }

      // HARD FILTER 2: post must score above the minimum threshold
      if (matchScore < 20) {
        console.log(`[Matching] Skipping post ${scrapedPostId} — score ${matchScore} below threshold`)
        await prisma.scrapedPostMatch.updateMany({
          where: { user_id: userId, scraped_post_id: scrapedPostId },
          data: { shown_to_user: false, shown_at: null },
        })
        return null
      }

      // HARD FILTER 3: user must not have hit their daily limit
      const limitCheck = await DailyLimitService.checkDailyLimit(userId)
      if (!limitCheck.canScrape) {
        console.log(`[Matching] Skipping post ${scrapedPostId} — daily limit reached for user ${userId}: ${limitCheck.reason}`)
        await prisma.scrapedPostMatch.updateMany({
          where: { user_id: userId, scraped_post_id: scrapedPostId },
          data: { shown_to_user: false, shown_at: null },
        })
        return null
      }

      // Post passed all filters — mark it as visible
      const now = new Date()
      const dailyLimit = await DailyLimitService.getDailyJobLimit(userId)

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
          shown_to_user: true,
          shown_at: now,
        },
        create: {
          user_id: userId,
          scraped_post_id: scrapedPostId,
          match_score: matchScore,
          match_quality: matchQuality,
          scraped_by_user: true,
          scraped_at: now,
          shown_to_user: true,
          shown_at: now,
        },
      })

      // Post-write verification: recount immediately after the upsert.
      // If two concurrent batches both passed checkDailyLimit at the same time
      // (race condition), the second one will see count > limit here and undo itself.
      const userForWindow = await prisma.user.findUnique({
        where: { id: userId },
        select: { daily_limit_reset_at: true }
      })
      const windowStart = DailyLimitService.getDailyWindowStart(
        (userForWindow as any)?.daily_limit_reset_at ?? null
      )
      const countAfterWrite = await prisma.scrapedPostMatch.count({
        where: {
          user_id: userId,
          shown_to_user: true,
          shown_at: { gte: windowStart },
          scrapedPost: { text: { contains: '@' } }
        }
      })

      if (countAfterWrite > dailyLimit) {
        // We're over the limit — undo this post (it was the one that tipped us over)
        await prisma.scrapedPostMatch.update({
          where: { id: match.id },
          data: { shown_to_user: false, shown_at: null }
        })
        console.log(`[Matching] Post ${scrapedPostId} undone — count ${countAfterWrite} exceeded limit ${dailyLimit}`)
        return null
      }

      // Increment the DB counter to keep it in sync
      await DailyLimitService.incrementDailyCount(userId)

      // Trigger AI Enrichment immediately
      await this.enrichMatchWithAI(match, post.text, post.post_url || "")

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
   * Match all scraped posts for a user.
   * Re-runs matching for every post this user has ever seen (to refresh scores).
   */
  static async matchAllScrapedPostsForUser(userId: string): Promise<{
    total: number
    matched: number
    good: number
    medium: number
    bad: number
  }> {
    try {
      // Get all posts already associated with this user (regardless of who scraped them)
      const matches = await prisma.scrapedPostMatch.findMany({
        where: { user_id: userId },
        select: { scraped_post_id: true },
      })

      const posts = matches.map((m: { scraped_post_id: string }) => ({ id: m.scraped_post_id }))

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

      return { total: posts.length, matched, good, medium, bad }
    } catch (error) {
      console.error('Error matching all scraped posts:', error)
      throw error
    }
  }

  /**
   * Fill a user's job matches from the global ScrapedPost pool WITHOUT running
   * the LinkedIn scraper.  Called at the start of every automation run so we
   * reuse posts other users have already scraped before touching LinkedIn.
   *
   * Returns the number of posts that were qualified and shown to this user so
   * the extension knows how many more it still needs to scrape from LinkedIn.
   */
  static async fillFromGlobalPool(userId: string): Promise<{
    found: number    // posts in DB that match keywords and have no existing match for this user
    qualified: number // of those, how many passed all filters and are now shown
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          skills: true,
          preferred_job_titles: true,
          job_types: true,
          remote_work_preferred: true,
        },
      })

      if (!user) return { found: 0, qualified: 0 }

      // Build keyword list from user's skills and job titles ONLY (not generic terms
      // like "remote" / "freelance" which match almost every job post and produce
      // irrelevant pool fills)
      const keywords = [
        ...(user.skills ?? []),
        ...(user.preferred_job_titles ?? []),
      ].map((k: string) => k.toLowerCase()).filter(Boolean)

      if (keywords.length === 0) return { found: 0, qualified: 0 }

      // 3-day recency window — pool posts older than 3 days are likely stale
      const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

      // Fetch posts from the global pool that:
      //  • have an email address (text contains '@')
      //  • are recent (last 7 days)
      //  • have NOT already been associated with this user
      // Limit 200 so we never do a full table scan
      const poolPosts = await prisma.scrapedPost.findMany({
        where: {
          text: { contains: '@' },
          created_at: { gte: since },
          matches: { none: { user_id: userId } },
        },
        orderBy: { created_at: 'desc' },
        take: 200,
        select: { id: true, text: true },
      })

      // Only use keywords that are at least 6 characters to avoid single generic words
      // (e.g. "dev", "js") matching completely irrelevant posts
      const meaningfulKeywords = keywords.filter((kw) => kw.length >= 6)
      if (meaningfulKeywords.length === 0) return { found: 0, qualified: 0 }

      // Filter in-memory: post must contain ALL words of at least one keyword phrase
      // e.g. "frontend developer" requires BOTH "frontend" AND "developer" to appear
      const relevant = poolPosts.filter((post: { id: string; text: string }) => {
        const text = post.text.toLowerCase()
        return meaningfulKeywords.some((kw) => {
          // Split multi-word keyword into individual words and require all to appear
          const words = kw.split(/\s+/).filter((w) => w.length >= 3)
          return words.every((word) => text.includes(word))
        })
      })

      if (relevant.length === 0) return { found: 0, qualified: 0 }

      // Create ScrapedPostMatch stubs (shown_to_user: false) so matchScrapedPostToUser
      // can upsert them.  We do this in bulk before the loop for performance.
      const now = new Date()
      // createMany with skipDuplicates protects against any race condition
      await prisma.scrapedPostMatch.createMany({
        data: relevant.map((post: { id: string; text: string }) => ({
          user_id: userId,
          scraped_post_id: post.id,
          scraped_by_user: false, // came from pool, not scraped by this user
          scraped_at: now,
          shown_to_user: false,
          shown_at: null,
          match_score: 0,
          match_quality: 'bad',
        })),
        skipDuplicates: true,
      })

      // Now run the full matching pipeline (email check, score, daily limit) for each
      let qualified = 0
      for (const post of relevant) {
        // Stop early if the user's daily limit is already reached
        const limitCheck = await DailyLimitService.checkDailyLimit(userId)
        if (!limitCheck.canScrape) break

        const result = await this.matchScrapedPostToUser(post.id, userId)
        if (result) qualified++
      }

      console.log(`[Pool] User ${userId}: found ${relevant.length} relevant posts in pool, ${qualified} qualified`)
      return { found: relevant.length, qualified }
    } catch (error) {
      console.error('[Pool] Error filling from global pool:', error)
      return { found: 0, qualified: 0 }
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
        prisma.scrapedPostMatch.count({
          where: { user_id: userId, scraped_by_user: true },
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

  private static async enrichMatchWithAI(match: any, postText: string, postUrl: string) {
    try {
      const { enrichScrapedPost } = await import('./ai-enrichment')
      await enrichScrapedPost(match.scraped_post_id, postText, postUrl)
    } catch (e) {
      console.error("AI Enrichment Failed:", e)
    }
  }
}







