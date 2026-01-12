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

    const userId = session.user.id

    // Get stats for the current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Parallel queries for better performance
    const [jobMatches, emailsSent, repliesReceived, recentActivity] = await Promise.all([
      // Total job matches this month
      prisma.jobMatch.count({
        where: {
          user_id: userId,
          matched_at: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Emails sent this month
      prisma.email.count({
        where: {
          user_id: userId,
          sent_at: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Replies received this month
      prisma.emailReply.count({
        where: {
          email: {
            user_id: userId,
          },
          received_at: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Recent activity (last 10 items)
      prisma.email.findMany({
        where: { user_id: userId },
        include: {
          job_match: {
            include: {
              job: {
                select: {
                  title: true,
                  company: true,
                },
              },
            },
          },
          replies: {
            select: {
              id: true,
              received_at: true,
              from_email: true,
            },
            orderBy: { received_at: 'desc' },
            take: 1,
          },
        },
        orderBy: { sent_at: 'desc' },
        take: 10,
      }),
    ])

    // Calculate response rate
    const totalEmails = emailsSent
    const responseRate = totalEmails > 0 ? (repliesReceived / totalEmails) * 100 : 0

    // Get match-to-application ratio
    const applicationsThisMonth = await prisma.jobMatch.count({
      where: {
        user_id: userId,
        applied: true,
        applied_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    const applicationRate = jobMatches > 0 ? (applicationsThisMonth / jobMatches) * 100 : 0

    return NextResponse.json({
      stats: {
        jobMatches: {
          current: jobMatches,
          change: 0, // TODO: Calculate month-over-month change
        },
        emailsSent: {
          current: emailsSent,
          change: 0,
        },
        repliesReceived: {
          current: repliesReceived,
          change: 0,
        },
        responseRate: {
          current: Math.round(responseRate * 100) / 100,
          change: 0,
        },
        applicationRate: {
          current: Math.round(applicationRate * 100) / 100,
          change: 0,
        },
      },
      recentActivity: recentActivity.map((email: any) => ({
        id: email.id,
        type: 'email_sent',
        title: `Applied to ${email.job_match.job.title}`,
        company: email.job_match.job.company,
        date: email.sent_at,
        hasReply: email.replies.length > 0,
        replyDate: email.replies[0]?.received_at,
      })),
    })
  } catch (error) {
    console.error("Dashboard overview error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
