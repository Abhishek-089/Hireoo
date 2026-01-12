import { prisma } from './prisma'
import { aiExtractionQueue } from './queue'

export interface ScrapedPostData {
  raw_html: string
  text: string
  post_url: string
  timestamp?: string
  linkedin_id?: string
}

export class ScrapingService {
  /**
   * Store a scraped LinkedIn post and queue it for AI extraction
   */
  static async storeScrapedPost(userId: string, postData: ScrapedPostData) {
    try {
      // Validate required fields
      if (!postData.post_url || !postData.post_url.trim()) {
        console.warn(`[ScrapingService] Skipping post with empty post_url for user ${userId}`)
        return {
          success: false,
          message: 'Post URL is required',
          postId: null,
        }
      }

      // Check if THIS USER has already scraped this post (based on linkedin_id or post_url)
      // Important: Check per-user, not globally, so different users can scrape the same post
      const orConditions: any[] = []
      
      // Only add post_url if it's not empty
      if (postData.post_url && postData.post_url.trim()) {
        orConditions.push({ post_url: postData.post_url.trim() })
      }
      
      // Only add linkedin_id if it exists and is not empty
      if (postData.linkedin_id && postData.linkedin_id.trim()) {
        orConditions.push({ linkedin_id: postData.linkedin_id.trim() })
      }
      
      // If no valid identifiers, we can't check for duplicates, but we'll still try to save
      if (orConditions.length === 0) {
        console.warn(`[ScrapingService] Post has no valid identifiers (post_url or linkedin_id), will save anyway:`, {
          post_url: postData.post_url,
          linkedin_id: postData.linkedin_id
        })
      } else {
        // Debug: Log what we're checking
        console.log(`[ScrapingService] Checking for duplicates for user ${userId}:`, {
          orConditions,
          post_url: postData.post_url,
          linkedin_id: postData.linkedin_id,
          userId: userId
        })

        // First, let's check total posts in DB for debugging
        const totalPostsCount = await prisma.scrapedPost.count()
        const userPostsCount = await prisma.scrapedPost.count({
          where: { user_id: userId }
        })
        console.log(`[ScrapingService] Database stats - Total posts: ${totalPostsCount}, User posts: ${userPostsCount}`)

        const existingPost = await prisma.scrapedPost.findFirst({
          where: {
            user_id: userId, // Only check posts for this specific user
            OR: orConditions
          }
        })

        if (existingPost) {
          console.log(`[ScrapingService] ⚠️ Post already exists for user ${userId}:`, {
            existingPostId: existingPost.id,
            linkedin_id: postData.linkedin_id,
            post_url: postData.post_url,
            existingLinkedinId: existingPost.linkedin_id,
            existingPostUrl: existingPost.post_url,
            existingUserId: existingPost.user_id,
            existingCreatedAt: existingPost.created_at
          })
          return {
            success: false,
            message: 'Post already scraped',
            postId: existingPost.id,
          }
        } else {
          console.log(`[ScrapingService] ✅ No duplicate found for user ${userId}, will create new post`)
        }
      }

      // Create the scraped post
      const scrapedPost = await prisma.scrapedPost.create({
        data: {
          user_id: userId,
          raw_html: postData.raw_html,
          text: postData.text,
          post_url: postData.post_url,
          linkedin_id: postData.linkedin_id,
          timestamp: postData.timestamp ? new Date(postData.timestamp) : null,
        },
      })

      console.log(`[ScrapingService] ✅ Stored new scraped post for user ${userId}:`, {
        postId: scrapedPost.id,
        linkedin_id: scrapedPost.linkedin_id,
        post_url: scrapedPost.post_url,
        textPreview: scrapedPost.text.substring(0, 100) + '...'
      })

      // Queue the post for AI extraction (non-blocking, don't fail if queue is unavailable)
      try {
        await this.queueForAIExtraction(scrapedPost.id, postData)
      } catch (queueError) {
        // Log but don't fail - the post is already stored
        console.warn('[ScrapingService] Failed to queue for AI extraction (non-critical):', queueError)
      }

      // Match the post to the user (non-blocking)
      try {
        const { ScrapedPostMatchingService } = await import('./scraped-post-matching')
        await ScrapedPostMatchingService.matchScrapedPostToUser(scrapedPost.id, userId)
      } catch (matchError) {
        // Log but don't fail - matching can happen later
        console.warn('[ScrapingService] Failed to match post (non-critical):', matchError)
      }

      return {
        success: true,
        message: 'Post stored and queued for processing',
        postId: scrapedPost.id,
      }
    } catch (error) {
      console.error('[ScrapingService] Error storing scraped post:', error)
      // Provide more detailed error information
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : { error: String(error) }
      
      console.error('[ScrapingService] Error details:', errorDetails)
      throw new Error(`Failed to store scraped post: ${errorMessage}`)
    }
  }

  /**
   * Queue a scraped post for AI extraction
   * This is optional - if Redis/queue is unavailable, we just skip it
   */
  private static async queueForAIExtraction(scrapedPostId: string, postData: ScrapedPostData) {
    // Skip queueing if Redis is not configured or available
    // This allows the API to work even without Redis
    if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
      console.log('[ScrapingService] Redis not configured, skipping queue')
      return
    }

    try {
      // Try to queue, but don't fail if it doesn't work
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
          {
            priority: 1,
            delay: 1000,
          }
        )
        console.log(`[ScrapingService] Queued AI extraction job for post: ${scrapedPostId}`)
      }
    } catch (error) {
      // Silently ignore queue errors - post storage is more important
      console.warn('[ScrapingService] Could not queue for AI extraction (non-critical):', 
        error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Get scraping statistics for a user
   */
  static async getScrapingStats(userId: string) {
    try {
      const [
        totalPosts,
        processedPosts,
        pendingPosts,
        recentPosts,
      ] = await Promise.all([
        // Total posts scraped
        prisma.scrapedPost.count({
          where: { user_id: userId },
        }),

        // Posts that have been processed
        prisma.scrapedPost.count({
          where: {
            user_id: userId,
            processed: true,
          },
        }),

        // Posts pending processing
        prisma.scrapedPost.count({
          where: {
            user_id: userId,
            processed: false,
          },
        }),

        // Recent posts (last 7 days)
        prisma.scrapedPost.count({
          where: {
            user_id: userId,
            created_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ])

      return {
        totalPosts,
        processedPosts,
        pendingPosts,
        recentPosts,
        processingRate: totalPosts > 0 ? Math.round((processedPosts / totalPosts) * 100) : 0,
      }
    } catch (error) {
      console.error('Error getting scraping stats:', error)
      throw new Error('Failed to get scraping statistics')
    }
  }

  /**
   * Get recent scraped posts for a user
   */
  static async getRecentPosts(userId: string, limit: number = 10) {
    try {
      const posts = await prisma.scrapedPost.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit,
        select: {
          id: true,
          text: true,
          post_url: true,
          linkedin_id: true,
          timestamp: true,
          created_at: true,
          processed: true,
        },
      })

      return posts.map(post => ({
        id: post.id,
        preview: post.text.substring(0, 200) + (post.text.length > 200 ? '...' : ''),
        postUrl: post.post_url,
        linkedinId: post.linkedin_id,
        timestamp: post.timestamp,
        createdAt: post.created_at,
        processed: post.processed,
      }))
    } catch (error) {
      console.error('Error getting recent posts:', error)
      throw new Error('Failed to get recent posts')
    }
  }

  /**
   * Mark a scraped post as processed
   */
  static async markPostProcessed(scrapedPostId: string, extractedData?: any) {
    try {
      await prisma.scrapedPost.update({
        where: { id: scrapedPostId },
        data: {
          processed: true,
          // You could store extracted data here in a future enhancement
        },
      })

      console.log(`Marked post ${scrapedPostId} as processed`)
    } catch (error) {
      console.error('Error marking post as processed:', error)
      throw new Error('Failed to update post status')
    }
  }
}


