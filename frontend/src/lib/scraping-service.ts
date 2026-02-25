import { prisma } from './prisma'
import { aiExtractionQueue } from './queue'

export interface ScrapedPostData {
  raw_html?: string  // Optional - text is used as fallback if HTML is unavailable
  text: string
  post_url: string
  timestamp?: string
  linkedin_id?: string
}

export class ScrapingService {
  /**
   * Store a scraped LinkedIn post and associate it with the user via ScrapedPostMatch.
   *
   * Posts are stored globally (shared across users). Duplicate detection is per-user
   * via ScrapedPostMatch so the same post can be stored once but seen by multiple users.
   */
  static async storeScrapedPost(userId: string, postData: ScrapedPostData) {
    try {
      // Validate required fields
      if (!postData.post_url?.trim()) {
        console.warn(`[ScrapingService] Skipping post with empty post_url for user ${userId}`)
        return {
          success: false,
          message: 'Post URL is required',
          postId: null,
        }
      }

      // Build OR conditions for duplicate check (globally, not per-user)
      const orConditions: any[] = []
      if (postData.post_url?.trim()) {
        orConditions.push({ post_url: postData.post_url.trim() })
      }
      if (postData.linkedin_id?.trim()) {
        orConditions.push({ linkedin_id: postData.linkedin_id.trim() })
      }

      // Check if the post already exists in the database (globally)
      let scrapedPost = orConditions.length > 0
        ? await prisma.scrapedPost.findFirst({ where: { OR: orConditions } })
        : null

      if (scrapedPost) {
        console.log(`[ScrapingService] Post already exists globally: ${scrapedPost.id}`)
      } else {
        // Create new global post
        console.log(`[ScrapingService] Creating new post for url: ${postData.post_url}`)
        scrapedPost = await prisma.scrapedPost.create({
          data: {
            raw_html: postData.raw_html || postData.text,
            text: postData.text,
            post_url: postData.post_url.trim(),
            linkedin_id: postData.linkedin_id?.trim() || null,
            timestamp: postData.timestamp ? new Date(postData.timestamp) : null,
          },
        })
        console.log(`[ScrapingService] ✅ Created new post: ${scrapedPost.id}`)
      }

      // Check if this user already has a match for this post
      const existingMatch = await prisma.scrapedPostMatch.findUnique({
        where: {
          user_id_scraped_post_id: {
            user_id: userId,
            scraped_post_id: scrapedPost.id,
          },
        },
      })

      if (existingMatch) {
        console.log(`[ScrapingService] ⚠️ User ${userId} already has match for post ${scrapedPost.id}`)
        return {
          success: false,
          message: 'Post already scraped by this user',
          postId: scrapedPost.id,
        }
      }

      // Create match record linking this user to the post
      await prisma.scrapedPostMatch.create({
        data: {
          user_id: userId,
          scraped_post_id: scrapedPost.id,
          match_score: 0,
          match_quality: 'pending',
          scraped_by_user: true,
          scraped_at: new Date(),
          shown_to_user: true,
          shown_at: new Date(),
        },
      })

      console.log(`[ScrapingService] ✅ Created match for user ${userId} → post ${scrapedPost.id}`)

      // Queue for AI extraction (non-blocking)
      try {
        await this.queueForAIExtraction(scrapedPost.id, postData)
      } catch (queueError) {
        console.warn('[ScrapingService] Failed to queue for AI extraction (non-critical):', queueError)
      }

      // Run post qualification / matching (non-blocking)
      try {
        const { ScrapedPostMatchingService } = await import('./scraped-post-matching')
        await ScrapedPostMatchingService.matchScrapedPostToUser(scrapedPost.id, userId)
      } catch (matchError) {
        console.warn('[ScrapingService] Failed to run matching (non-critical):', matchError)
      }

      return {
        success: true,
        message: 'Post stored successfully',
        postId: scrapedPost.id,
      }
    } catch (error) {
      console.error('[ScrapingService] Error storing scraped post:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[ScrapingService] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw new Error(`Failed to store scraped post: ${errorMessage}`)
    }
  }

  /**
   * Queue a scraped post for AI extraction.
   * Non-critical — if Redis is unavailable, this is silently skipped.
   */
  private static async queueForAIExtraction(scrapedPostId: string, postData: ScrapedPostData) {
    if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
      console.log('[ScrapingService] Redis not configured, skipping queue')
      return
    }

    try {
      const queue = aiExtractionQueue
      if (queue && typeof queue.add === 'function') {
        await queue.add(
          'extract-job-data',
          {
            scrapedPostId,
            rawHtml: postData.raw_html,
            text: postData.text,
            postUrl: postData.post_url,
          },
          { priority: 1, delay: 1000 }
        )
        console.log(`[ScrapingService] Queued AI extraction for post: ${scrapedPostId}`)
      }
    } catch (error) {
      console.warn('[ScrapingService] Could not queue for AI extraction (non-critical):',
        error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Get scraping statistics for a user (via ScrapedPostMatch).
   */
  static async getScrapingStats(userId: string) {
    try {
      const [totalPosts, recentPosts] = await Promise.all([
        prisma.scrapedPostMatch.count({ where: { user_id: userId } }),
        prisma.scrapedPostMatch.count({
          where: {
            user_id: userId,
            matched_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        }),
      ])

      return {
        totalPosts,
        processedPosts: 0,
        pendingPosts: 0,
        recentPosts,
        processingRate: 0,
      }
    } catch (error) {
      console.error('Error getting scraping stats:', error)
      throw new Error('Failed to get scraping statistics')
    }
  }

  /**
   * Get recent scraped posts for a user (via ScrapedPostMatch).
   */
  static async getRecentPosts(userId: string, limit: number = 10) {
    try {
      const matches = await prisma.scrapedPostMatch.findMany({
        where: { user_id: userId },
        orderBy: { matched_at: 'desc' },
        take: limit,
        include: { scrapedPost: true },
      })

      return matches.map(match => ({
        id: match.scrapedPost.id,
        preview: match.scrapedPost.text.substring(0, 200) + (match.scrapedPost.text.length > 200 ? '...' : ''),
        postUrl: match.scrapedPost.post_url,
        linkedinId: match.scrapedPost.linkedin_id,
        timestamp: match.scrapedPost.timestamp,
        createdAt: match.scrapedPost.created_at,
        processed: match.scrapedPost.processed,
      }))
    } catch (error) {
      console.error('Error getting recent posts:', error)
      throw new Error('Failed to get recent posts')
    }
  }

  /**
   * Mark a scraped post as processed.
   */
  static async markPostProcessed(scrapedPostId: string, extractedData?: any) {
    try {
      await prisma.scrapedPost.update({
        where: { id: scrapedPostId },
        data: { processed: true },
      })
      console.log(`Marked post ${scrapedPostId} as processed`)
    } catch (error) {
      console.error('Error marking post as processed:', error)
      throw new Error('Failed to update post status')
    }
  }
}
