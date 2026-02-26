import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ScrapingService } from "@/lib/scraping-service"
import { prisma } from "@/lib/prisma"
import { DailyLimitService } from "@/lib/daily-limit-service"

import { getUserIdFromRequest } from "@/lib/api-auth"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/scraping/posts - Request received')

    const userId = await getUserIdFromRequest(request)
    console.log('[API] User ID from request:', userId ? 'Found' : 'Not found')

    if (!userId) {
      console.error('[API] Unauthorized - no valid user ID in request (token missing or expired)')
      return NextResponse.json(
        { error: 'Unauthorized - please sign in to Hireoo and reconnect the extension' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Verify the user actually exists in the DB (catches dev-token vs prod-DB mismatches)
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!userExists) {
      console.error(`[API] User ${userId} not found in database - JWT may be from a different environment`)
      return NextResponse.json(
        { error: 'User not found - please sign in to the Hireoo website and reconnect the extension' },
        { status: 401, headers: corsHeaders }
      )
    }

    let body
    try {
      body = await request.json()
      console.log('[API] Request body parsed successfully')
    } catch (parseError) {
      console.error('[API] Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400, headers: corsHeaders }
      )
    }

    const posts = body?.posts
    console.log('[API] Posts array:', Array.isArray(posts) ? `${posts.length} posts` : 'Not an array')

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: "No posts provided" },
        { status: 400, headers: corsHeaders }
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
      const text =
        post.text ||
        post.raw_text || // some scrapers only send raw_text
        ''

      // raw_html is optional - use text as fallback so posts without HTML are still saved
      const raw_html =
        post.html ||
        post.raw_html ||
        post.raw_text ||
        text || // last resort: use the text content as the "html"
        null

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
        rawHtmlLength: raw_html?.length || 0,
        rawHtmlSource: post.html ? 'post.html' : post.raw_html ? 'post.raw_html' : post.raw_text ? 'post.raw_text' : text ? 'text' : 'NONE',
        hasText: !!text && text.length > 0,
        textLength: text?.length || 0,
        hasPostUrl: !!post_url,
        postUrl: post_url,
        linkedinId: linkedin_id,
        postId: post.id,
        post_id: post.post_id,
        postUrl_field: post.postUrl,
        post_url_field: post.post_url
      })

      if (!text || !post_url) {
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
        results.push({
          success: false,
          error: e instanceof Error ? e.message : String(e),
          postId: linkedin_id,
          stack: e instanceof Error ? e.stack : undefined
        } as any)
      }
    }

    console.log(`[API] Processing complete: ${successCount} successful, ${errorCount} errors out of ${posts.length} total`)

    // Count how many posts actually qualified (created ScrapedPostMatch)
    const qualifiedCount = results.filter(r => r.qualified === true).length
    const notQualifiedCount = results.filter(r => r.qualified === false).length
    const duplicateCount = results.filter(r => r.success === false && r.message?.includes('already scraped')).length

    console.log(`[API] 📊 Qualification summary:`)
    console.log(`  ✅ Qualified: ${qualifiedCount}`)
    console.log(`  ❌ Not qualified: ${notQualifiedCount}`)
    console.log(`  🔁 Duplicates: ${duplicateCount}`)
    console.log(`  📝 Total processed: ${results.length}`)

    // Log reasons for non-qualification
    const nonQualifiedReasons = results
      .filter(r => r.qualified === false && r.message)
      .map(r => r.message)
    if (nonQualifiedReasons.length > 0) {
      console.log(`[API] ⚠️ Non-qualification reasons:`)
      nonQualifiedReasons.forEach((reason, i) => {
        console.log(`  ${i + 1}. ${reason}`)
      })
    }

    // Check daily limit status after processing (best-effort, may not be available on all deployments)
    let limitInfo = null
    try {
      limitInfo = await DailyLimitService.getDailyLimitInfo(userId)
      console.log(`[API] Daily limit status:`, {
        current: limitInfo.current,
        limit: limitInfo.limit,
        reached: !limitInfo.canScrape,
        resetAt: limitInfo.resetAt
      })
    } catch (limitError) {
      console.warn('[API] Could not fetch daily limit info (schema may not include daily_limit fields):', limitError instanceof Error ? limitError.message : String(limitError))
    }

    const limitReached = limitInfo ? !limitInfo.canScrape : false

    return NextResponse.json({
      success: true,
      processed: successCount,
      qualified: qualifiedCount,
      total: posts.length,
      errors: errorCount,
      results,
      ...(limitInfo && {
        dailyLimit: {
          reached: limitReached,
          current: limitInfo.current,
          limit: limitInfo.limit,
          resetAt: limitInfo.resetAt
        }
      })
    }, { headers: corsHeaders })
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
      { status: 500, headers: corsHeaders }
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
        { status: 401, headers: corsHeaders }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all'
    const skip = (page - 1) * limit

    // Get posts via ScrapedPostMatch (user-specific)
    const matchWhere: any = { user_id: userId }

    const [totalCount, matches] = await Promise.all([
      prisma.scrapedPostMatch.count({ where: matchWhere }),
      prisma.scrapedPostMatch.findMany({
        where: matchWhere,
        orderBy: { matched_at: 'desc' },
        skip,
        take: limit,
        include: { scrapedPost: true },
      }),
    ])

    const posts = matches.map((m: any) => m.scrapedPost)

    return NextResponse.json({
      data: posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }, { headers: corsHeaders })

  } catch (error) {
    console.error("Get scraped posts API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    )
  }
}


