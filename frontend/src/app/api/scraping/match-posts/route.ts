import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ScrapedPostMatchingService } from "@/lib/scraped-post-matching"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Match all scraped posts for this user
    const result = await ScrapedPostMatchingService.matchAllScrapedPostsForUser(
      session.user.id
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Error matching scraped posts:", error)
    return NextResponse.json(
      { error: "Failed to match scraped posts" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get match statistics
    const stats = await ScrapedPostMatchingService.getMatchStats(session.user.id)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error getting match stats:", error)
    return NextResponse.json(
      { error: "Failed to get match statistics" },
      { status: 500 }
    )
  }
}





