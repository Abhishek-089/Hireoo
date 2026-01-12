import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ScrapingService, ScrapedPostData } from "@/lib/scraping-service"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate required fields
    const { raw_html, text, post_url } = body

    if (!raw_html || !text || !post_url) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["raw_html", "text", "post_url"],
          received: Object.keys(body)
        },
        { status: 400 }
      )
    }

    // Validate data types
    if (typeof raw_html !== 'string' || typeof text !== 'string' || typeof post_url !== 'string') {
      return NextResponse.json(
        { error: "Invalid data types. raw_html, text, and post_url must be strings" },
        { status: 400 }
      )
    }

    // Validate post_url is a valid URL
    try {
      new URL(post_url)
    } catch {
      return NextResponse.json(
        { error: "Invalid post_url format" },
        { status: 400 }
      )
    }

    // Prepare scraped post data
    const postData: ScrapedPostData = {
      raw_html,
      text,
      post_url,
      timestamp: body.timestamp,
      linkedin_id: body.linkedin_id,
    }

    // Store the scraped post and queue for AI processing
    const result = await ScrapingService.storeScrapedPost(session.user.id, postData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        postId: result.postId,
      })
    } else {
      // Post already exists - return success with existing post ID
      return NextResponse.json({
        success: true,
        message: result.message,
        postId: result.postId,
      })
    }

  } catch (error) {
    console.error("Scrape post API error:", error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('already scraped')) {
        return NextResponse.json(
          { error: "Post already scraped" },
          { status: 409 } // Conflict
        )
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve scraping statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'stats' // 'stats' or 'recent'

    if (type === 'stats') {
      const stats = await ScrapingService.getScrapingStats(session.user.id)
      return NextResponse.json(stats)
    } else if (type === 'recent') {
      const limit = parseInt(searchParams.get('limit') || '10')
      const recentPosts = await ScrapingService.getRecentPosts(session.user.id, limit)
      return NextResponse.json({ posts: recentPosts })
    }

    return NextResponse.json(
      { error: "Invalid type parameter. Use 'stats' or 'recent'" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Get scraping data API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


