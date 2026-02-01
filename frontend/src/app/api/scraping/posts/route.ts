import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ScrapingService } from "@/lib/scraping-service"
import { prisma } from "@/lib/prisma"

import { getUserIdFromRequest } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/scraping/posts - Request received')

    const userId = await getUserIdFromRequest(request)
    console.log('[API] User ID from request:', userId ? 'Found' : 'Not found')

    if (!userId) {
      console.warn('[API] Unauthorized - no user ID')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
      console.log('[API] Request body parsed successfully')
    } catch (parseError) {
      console.error('[API] Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const posts = body?.posts
    console.log('[API] Posts array:', Array.isArray(posts) ? `${posts.length} posts` : 'Not an array')

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: "No posts provided" },
        { status: 400 }
      )
    }

    console.log(`[API] Received ${posts.length} posts from extension for user ${userId}`)

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const post of posts) {
      if (!post || typeof post !== "object") {
        console.warn("[API] Skipping invalid post:", post)
        errorCount++
        continue
      }

      // Map extension format to API format
      // We support two shapes:
      // 1) New LinkedInScraper posts: { id, text, html, postUrl, timestamp, ... }
      // 2) Older/network posts: { post_id, raw_text, post_url, scraped_at, ... }
      const raw_html =
        post.html ||
        post.raw_html ||
        post.raw_text || // fallback: treat raw_text as HTML-ish content
        null

      const text =
        post.text ||
        post.raw_text || // some scrapers only send raw_text
        ''

      const linkedin_id = (post.id || post.post_id || '').toString().trim() || null

      // Construct post_url from available fields
      // Priority: post.postUrl > post.post_url > construct from post_id > construct from linkedin_id
      let post_url =
        (post.postUrl && post.postUrl.trim()) ||
        (post.post_url && post.post_url.trim()) ||
        null

      // If still no URL, try to construct from post_id or linkedin_id
      if (!post_url) {
        const postId = post.post_id || post.id || linkedin_id
        if (postId && typeof postId === 'string' && postId.trim()) {
          // LinkedIn post URLs can be in different formats
          // Try the most common format first
          post_url = `https://www.linkedin.com/feed/update/${postId.trim()}`
        }
      }

      const timestamp = post.timestamp || post.scraped_at || null

      // Log the post data for debugging
      console.log(`[API] Processing post:`, {
        hasHtml: !!raw_html,
        hasText: !!text && text.length > 0,
        hasPostUrl: !!post_url,
        postUrl: post_url,
        linkedinId: linkedin_id,
        postId: post.id,
        post_id: post.post_id,
        postUrl_field: post.postUrl,
        post_url_field: post.post_url
      })

      if (!raw_html || !text || !post_url) {
        console.warn("[API] Skipping post with missing required fields:", {
          hasHtml: !!raw_html,
          hasText: !!text,
          hasPostUrl: !!post_url,
          postId: linkedin_id,
          originalPost: {
            id: post.id,
            post_id: post.post_id,
            postUrl: post.postUrl,
            post_url: post.post_url
          }
        })
        errorCount++
        continue
      }

      try {
        const result = await ScrapingService.storeScrapedPost(userId, {
          raw_html,
          text,
          post_url,
          timestamp,
          linkedin_id,
        })

        if (result.success) {
          successCount++
          console.log(`[API] Successfully stored post: ${result.postId}`)
        } else {
          errorCount++
          console.log(`[API] Post already exists or failed: ${result.message}`)
        }

        results.push(result)
      } catch (e) {
        errorCount++
        console.error("[API] Failed to store scraped post:", {
          error: e instanceof Error ? e.message : String(e),
          postId: linkedin_id,
          stack: e instanceof Error ? e.stack : undefined
        })
      }
    }

    console.log(`[API] Processing complete: ${successCount} successful, ${errorCount} errors out of ${posts.length} total`)

    return NextResponse.json({
      success: true,
      processed: successCount,
      total: posts.length,
      errors: errorCount,
      results
    })
  } catch (error) {
    console.error("[API] Extension scraping posts API error:", error)
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : { error: String(error) }

    console.error("[API] Full error details:", JSON.stringify(errorDetails, null, 2))

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        // Only include stack in development
        ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined })
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve scraped posts for a user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all'
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { user_id: userId }
    if (status !== 'all') {
      where.status = status
    }

    // Get total count
    const totalCount = await prisma.scrapedPost.count({ where })

    // Get posts
    const posts = await prisma.scrapedPost.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    })

    return NextResponse.json({
      data: posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })

  } catch (error) {
    console.error("Get scraped posts API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


