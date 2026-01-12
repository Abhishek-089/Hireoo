import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { EmailGeneratorService } from "@/lib/email-generator"
import { emailGenerationQueue } from "@/lib/queue"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { jobId, matchId } = await request.json()

    if (!jobId || !matchId) {
      return NextResponse.json(
        { error: "jobId and matchId are required" },
        { status: 400 }
      )
    }

    // Verify the match belongs to the user
    const { prisma } = await import('@/lib/prisma')
    const match = await prisma.jobMatch.findFirst({
      where: {
        id: matchId,
        user_id: session.user.id,
        job_id: jobId,
      },
    })

    if (!match) {
      return NextResponse.json(
        { error: "Match not found or doesn't belong to user" },
        { status: 404 }
      )
    }

    // Check if email draft already exists for this match
    const existingDraft = await prisma.emailDraft.findFirst({
      where: {
        user_id: session.user.id,
        match_id: matchId,
      },
    })

    if (existingDraft) {
      return NextResponse.json({
        success: true,
        message: "Email draft already exists for this match",
        draftId: existingDraft.id,
        existing: true,
      })
    }

    // Queue email generation job
    await emailGenerationQueue.add(
      'generate-cold-email',
      {
        userId: session.user.id,
        jobId,
        matchId,
      },
      {
        priority: 3, // High priority for user-requested emails
        delay: 500, // Small delay to prevent spam
        removeOnComplete: 10,
        removeOnFail: 5,
      }
    )

    return NextResponse.json({
      success: true,
      message: "Email generation queued successfully",
      queued: true,
    })

  } catch (error) {
    console.error("Email generation API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


