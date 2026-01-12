import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // 'all', 'applied', 'not-applied'
    const sortBy = searchParams.get('sortBy') || 'matched_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const userId = session.user.id
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      user_id: userId,
    }

    if (status === 'applied') {
      where.applied = true
    } else if (status === 'not-applied') {
      where.applied = false
    }

    // Get total count for pagination
    const totalCount = await prisma.jobMatch.count({ where })

    // Get job matches with job details
    const jobMatches = await prisma.jobMatch.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            salary_range: true,
            job_type: true,
            posted_date: true,
            status: true,
          },
        },
        emails: {
          select: {
            id: true,
            sent_at: true,
            status: true,
          },
          orderBy: { sent_at: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            emails: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    })

    // Format the response
    const formattedMatches = jobMatches.map((match: any) => ({
      id: match.id,
      job: match.job,
      matchScore: match.match_score,
      matchedAt: match.matched_at,
      applied: match.applied,
      appliedAt: match.applied_at,
      notes: match.notes,
      lastEmailSent: match.emails[0]?.sent_at || null,
      totalEmails: match._count.emails,
      status: match.applied ? 'applied' : 'matched',
    }))

    return NextResponse.json({
      data: formattedMatches,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Job matches API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST endpoint to mark job as applied
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { jobMatchId, applied, notes } = await request.json()

    if (!jobMatchId) {
      return NextResponse.json(
        { error: "Job match ID is required" },
        { status: 400 }
      )
    }

    // Verify the job match belongs to the user
    const jobMatch = await prisma.jobMatch.findFirst({
      where: {
        id: jobMatchId,
        user_id: session.user.id,
      },
    })

    if (!jobMatch) {
      return NextResponse.json(
        { error: "Job match not found" },
        { status: 404 }
      )
    }

    // Update the job match
    const updatedMatch = await prisma.jobMatch.update({
      where: { id: jobMatchId },
      data: {
        applied: applied ?? true,
        applied_at: applied ? new Date() : null,
        notes: notes || jobMatch.notes,
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      jobMatch: updatedMatch,
    })
  } catch (error) {
    console.error("Update job match error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
