import { NextRequest, NextResponse } from "next/server"
import { ScrapedPostMatchingService } from "@/lib/scraped-post-matching"
import { DailyLimitService } from "@/lib/daily-limit-service"
import { getUserIdFromRequest } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * Called by the extension at the very start of an automation run.
 *
 * 1. Checks the global ScrapedPost pool for posts that match the user's keywords.
 * 2. Creates ScrapedPostMatch records and runs the full qualification pipeline.
 * 3. Returns how many posts were found so the extension knows how many it still
 *    needs to scrape from LinkedIn (target - qualifiedFromDB).
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    // Confirm user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401, headers: corsHeaders }
      )
    }

    // Get the user's current limit status
    const limitInfo = await DailyLimitService.getDailyLimitInfo(userId)

    // If the user has already hit their daily limit, skip the pool search entirely
    if (!limitInfo.canScrape) {
      return NextResponse.json(
        {
          success: true,
          found: 0,
          qualified: 0,
          alreadyAtLimit: true,
          current: limitInfo.current,
          limit: limitInfo.limit,
          message: `Daily limit already reached (${limitInfo.current}/${limitInfo.limit})`,
        },
        { headers: corsHeaders }
      )
    }

    // Search global pool and fill matches for this user
    const { found, qualified } = await ScrapedPostMatchingService.fillFromGlobalPool(userId)

    // Re-fetch limit info after filling so the extension gets the fresh count
    const updatedLimit = await DailyLimitService.getDailyLimitInfo(userId)

    return NextResponse.json(
      {
        success: true,
        found,
        qualified,
        alreadyAtLimit: !updatedLimit.canScrape,
        current: updatedLimit.current,
        limit: updatedLimit.limit,
        // How many the extension still needs to scrape from LinkedIn
        remaining: Math.max(0, updatedLimit.limit - updatedLimit.current),
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("[Prefill] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    )
  }
}
