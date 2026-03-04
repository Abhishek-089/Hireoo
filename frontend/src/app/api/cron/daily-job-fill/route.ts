import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ScrapedPostMatchingService } from "@/lib/scraped-post-matching"
import { DailyLimitService } from "@/lib/daily-limit-service"

/**
 * Hourly Job Fill Cron
 *
 * Runs every hour (scheduled via Vercel Cron: "0 * * * *").
 *
 * Each user has their OWN daily reset time — it is set to 24 hours after the
 * first time their pool was filled, so it is different for every user.
 * A fixed midnight cron would miss users whose window resets at a different
 * hour.  By running every hour and only touching users whose personal
 * daily_limit_reset_at has already passed (window expired), we fill each user's
 * queue within ~1 hour of their own reset time.
 *
 * Security: requests must carry the CRON_SECRET header that Vercel sets
 * automatically, or an Authorization header with the same secret (for manual
 * testing).
 */

// How many users to process in one invocation before stopping (avoid timeouts)
const BATCH_SIZE = 50

export async function GET(req: NextRequest) {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get("authorization")
  const cronHeader = req.headers.get("x-vercel-cron-signature") // set by Vercel

  const isVercelCron = !!cronHeader // Vercel signs its own cron calls
  const isManualCall =
    cronSecret && authHeader === `Bearer ${cronSecret}`

  if (!isVercelCron && !isManualCall) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const startedAt = Date.now()
  const results: Array<{
    userId: string
    found: number
    qualified: number
    error?: string
  }> = []

  try {
    // ── Find eligible users whose daily window has just reset ─────────────
    //
    // We only process users where:
    //   1. Their personal reset time has passed (daily_limit_reset_at <= now),
    //      meaning their 24-h window rolled over and they can receive new jobs.
    //   2. OR they have never been filled yet (daily_limit_reset_at IS NULL).
    //   3. AND they have at least one skill or preferred job title set.
    //
    // This means a user who searched at 10am gets refilled around 10am the
    // next day, not at some fixed midnight that might be hours off.
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { skills: { isEmpty: false } },
              { preferred_job_titles: { isEmpty: false } },
            ],
          },
          {
            OR: [
              { daily_limit_reset_at: null },           // never filled before
              { daily_limit_reset_at: { lte: now } },   // window has expired
            ],
          },
        ],
      },
      select: {
        id: true,
        skills: true,
        preferred_job_titles: true,
        daily_limit_reset_at: true,
      },
      take: BATCH_SIZE,
      orderBy: { daily_limit_reset_at: "asc" }, // oldest reset first
    })

    console.log(`[DailyFill] Starting for ${users.length} eligible users`)

    // ── Process each user ─────────────────────────────────────────────────
    for (const user of users) {
      try {
        // Reset daily limit if the window has rolled over
        await DailyLimitService.resetDailyLimitIfNeeded(user.id)

        // Check if there's still room in today's quota
        const limitInfo = await DailyLimitService.getDailyLimitInfo(user.id)
        if (!limitInfo.canScrape) {
          console.log(
            `[DailyFill] Skipping user ${user.id} — daily limit already reached (${limitInfo.current}/${limitInfo.limit})`
          )
          results.push({ userId: user.id, found: 0, qualified: 0 })
          continue
        }

        // Fill from the global pool using the user's saved keywords
        const { found, qualified } =
          await ScrapedPostMatchingService.fillFromGlobalPool(user.id)

        console.log(
          `[DailyFill] User ${user.id}: found=${found} qualified=${qualified}`
        )
        results.push({ userId: user.id, found, qualified })
      } catch (userErr) {
        const msg =
          userErr instanceof Error ? userErr.message : String(userErr)
        console.error(`[DailyFill] Error for user ${user.id}:`, msg)
        results.push({ userId: user.id, found: 0, qualified: 0, error: msg })
      }
    }
  } catch (err) {
    console.error("[DailyFill] Fatal error:", err)
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    )
  }

  const totalQualified = results.reduce((s, r) => s + r.qualified, 0)
  const totalFound = results.reduce((s, r) => s + r.found, 0)
  const errors = results.filter((r) => r.error).length

  console.log(
    `[DailyFill] Done in ${Date.now() - startedAt}ms — users=${results.length} found=${totalFound} qualified=${totalQualified} errors=${errors}`
  )

  return NextResponse.json({
    success: true,
    usersProcessed: results.length,
    totalFound,
    totalQualified,
    errors,
    durationMs: Date.now() - startedAt,
  })
}
