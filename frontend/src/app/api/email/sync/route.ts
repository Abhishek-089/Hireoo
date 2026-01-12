import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { gmailSyncQueue } from "@/lib/queue"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { sinceTimestamp } = await request.json()

    // Validate timestamp if provided
    if (sinceTimestamp && (isNaN(sinceTimestamp) || sinceTimestamp < 0)) {
      return NextResponse.json(
        { error: "Invalid sinceTimestamp" },
        { status: 400 }
      )
    }

    // Queue Gmail sync job
    await gmailSyncQueue.add(
      'sync-gmail-messages',
      {
        userId: session.user.id,
        sinceTimestamp: sinceTimestamp || null,
      },
      {
        priority: 2, // Medium priority
        delay: 1000, // Small delay to prevent spam
        removeOnComplete: 5,
        removeOnFail: 10,
      }
    )

    return NextResponse.json({
      success: true,
      message: "Gmail sync queued successfully",
      queued: true,
    })

  } catch (error) {
    console.error("Gmail sync API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


