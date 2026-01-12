import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { JobMatchingService } from "@/lib/job-matching"

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
    const limit = parseInt(searchParams.get('limit') || '20')
    const quality = searchParams.get('quality') // 'good', 'medium', 'bad', or null for all

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 }
      )
    }

    // Get user's top matches
    const matches = await JobMatchingService.getTopMatchesForUser(session.user.id, limit)

    // Filter by quality if specified
    let filteredMatches = matches
    if (quality && ['good', 'medium', 'bad'].includes(quality)) {
      filteredMatches = matches.filter((match: any) => match.matchQuality === quality)
    }

    return NextResponse.json({
      matches: filteredMatches,
      total: matches.length,
      filtered: filteredMatches.length,
      quality: quality || 'all',
    })

  } catch (error) {
    console.error("Get user matches API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Update match application status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { matchId, applied, notes } = await request.json()

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 }
      )
    }

    // Verify the match belongs to the user
    const { prisma } = await import('@/lib/prisma')
    const match = await prisma.jobMatch.findUnique({
      where: { id: matchId },
      select: { user_id: true },
    })

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      )
    }

    if (match.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Update the match
    await JobMatchingService.updateMatchApplication(matchId, applied, notes)

    return NextResponse.json({
      success: true,
      message: "Match updated successfully",
    })

  } catch (error) {
    console.error("Update match API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


