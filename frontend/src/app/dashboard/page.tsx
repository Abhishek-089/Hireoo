import { OverviewStats } from "@/components/dashboard/OverviewStats"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { ExtensionAutoLogin } from "@/components/extension/ExtensionAutoLogin"
import { DailyLimitProgress } from "@/components/dashboard/DailyLimitProgress"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type DashboardPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getDashboardStats(userId: string) {
  try {
    const [
      matchesCount,
      applicationsCount,
      emailStats
    ] = await Promise.all([
      // 1. Job Matches (Actionable: contains "@" and NOT applied)
      prisma.scrapedPostMatch.count({
        where: {
          user_id: userId,
          NOT: {
            OR: [
              { applied: true },
              {
                scrapedPost: {
                  applications: { some: { user_id: userId } }
                }
              }
            ]
          }
        }
      }),

      // 2. Emails Sent (Applications with thread ID)
      prisma.scrapedApplication.count({
        where: {
          user_id: userId,
          gmail_thread_id: { not: null }
        }
      }),

      // 3. Replies (Incoming messages in application threads)
      prisma.scrapedApplication.findMany({
        where: {
          user_id: userId,
          gmail_thread_id: { not: null }
        },
        select: { gmail_thread_id: true }
      }).then(async (apps: { gmail_thread_id: string | null }[]) => {
        const threadIds = apps.map(a => a.gmail_thread_id).filter(Boolean) as string[]

        if (threadIds.length === 0) return 0

        // Count threads that have incoming messages (replies)
        const replies = await prisma.emailLog.groupBy({
          by: ['thread_id'],
          where: {
            user_id: userId,
            thread_id: { in: threadIds },
            direction: 'received',
            is_reply: true,
          },
        })

        return replies.length
      })
    ])

    const repliesCount = emailStats
    const responseRate = applicationsCount > 0
      ? Math.round((repliesCount / applicationsCount) * 100)
      : 0

    return {
      jobMatches: matchesCount,
      emailsSent: applicationsCount,
      repliesReceived: repliesCount,
      responseRate: responseRate
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      jobMatches: 0,
      emailsSent: 0,
      repliesReceived: 0,
      responseRate: 0
    }
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id // Safe access with previous fix pattern

  const stats = userId
    ? await getDashboardStats(userId)
    : { jobMatches: 0, emailsSent: 0, repliesReceived: 0, responseRate: 0 }

  const awaitedSearchParams = await searchParams
  const pageParam = awaitedSearchParams?.page
  const pageStr = Array.isArray(pageParam) ? pageParam[0] : pageParam
  const page = pageStr ? Math.max(1, parseInt(pageStr, 10) || 1) : 1

  // Check if this is a new user (coming from registration)
  const newParam = awaitedSearchParams?.new
  const newParamStr = Array.isArray(newParam) ? newParam[0] : newParam
  const isNewUser = newParamStr === "true"

  const userStatus = userId ? await prisma.user.findUnique({
    where: { id: userId },
    select: {
      gmail_connected: true,
      extension_installed: true,
      linkedin_connected: true,
      resume_uploaded: true,
    }
  }) : null

  // Dynamic greeting based on user type
  const greeting = isNewUser ? "Hello" : "Welcome back"

  return (
    <>
      <ExtensionAutoLogin />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{greeting}, {session?.user?.name || "User"} 👋</h1>
          <p className="mt-2 text-gray-600">
            {isNewUser
              ? "Welcome to Hireoo! Let's get started with your job search."
              : "Here's what's happening with your job search today."}
          </p>
        </div>

        <DailyLimitProgress />
        <OverviewStats stats={stats} />
        <QuickActions status={userStatus} />
        <RecentActivity />
      </div>
    </>
  )
}
