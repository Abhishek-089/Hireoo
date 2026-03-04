import { OverviewStats } from "@/components/dashboard/OverviewStats"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { ExtensionAutoLogin } from "@/components/extension/ExtensionAutoLogin"
import { DailyLimitProgress } from "@/components/dashboard/DailyLimitProgress"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { SlidersHorizontal, ArrowRight } from "lucide-react"

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
      prisma.scrapedPostMatch.count({
        where: {
          user_id: userId,
          shown_to_user: true,
          applied: false,
          scrapedPost: {
            text: { contains: '@' },
            applications: { none: { user_id: userId } }
          }
        }
      }),
      prisma.scrapedApplication.count({
        where: { user_id: userId, gmail_thread_id: { not: null } }
      }),
      prisma.scrapedApplication.findMany({
        where: { user_id: userId, gmail_thread_id: { not: null } },
        select: { gmail_thread_id: true }
      }).then(async (apps: { gmail_thread_id: string | null }[]) => {
        const threadIds = apps.map(a => a.gmail_thread_id).filter(Boolean) as string[]
        if (threadIds.length === 0) return 0
        const replies = await prisma.emailLog.groupBy({
          by: ['thread_id'],
          where: { user_id: userId, thread_id: { in: threadIds }, direction: 'received', is_reply: true },
        })
        return replies.length
      })
    ])

    const repliesCount = emailStats
    const responseRate = applicationsCount > 0
      ? Math.round((repliesCount / applicationsCount) * 100)
      : 0

    return { jobMatches: matchesCount, emailsSent: applicationsCount, repliesReceived: repliesCount, responseRate }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { jobMatches: 0, emailsSent: 0, repliesReceived: 0, responseRate: 0 }
  }
}

function getGreetingTime() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  const stats = userId
    ? await getDashboardStats(userId)
    : { jobMatches: 0, emailsSent: 0, repliesReceived: 0, responseRate: 0 }

  const awaitedSearchParams = await searchParams
  const newParamStr = Array.isArray(awaitedSearchParams?.new) ? awaitedSearchParams.new[0] : awaitedSearchParams?.new
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

  const firstName = session?.user?.name?.split(" ")[0] || "there"
  const greeting = isNewUser ? `Welcome to Hireoo, ${firstName}!` : `${getGreetingTime()}, ${firstName}`

  return (
    <>
      <ExtensionAutoLogin />
      <div className="space-y-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isNewUser
                ? "Let's set things up so Hireoo can start working for you."
                : "Here's what's happening with your job search."}
            </p>
          </div>
          <div className="text-xs text-gray-400 shrink-0">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* Job Preferences banner */}
        <Link href="/onboarding" className="group block">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between gap-4 hover:shadow-lg hover:shadow-indigo-200 transition-all">
            {/* Background decoration */}
            <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative flex items-center gap-4">
              <div className="shrink-0 p-2.5 rounded-xl bg-white/15">
                <SlidersHorizontal className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Start Your Job Search</p>
                <p className="text-sm text-indigo-200 mt-0.5">
                  Enter your skills, target role and upload your resume — we'll find and apply to matching jobs for you.
                </p>
              </div>
            </div>
            <div className="relative shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-indigo-700 text-sm font-bold group-hover:bg-indigo-50 transition-colors whitespace-nowrap">
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Daily limit bar */}
        <DailyLimitProgress />

        {/* Stats grid */}
        <OverviewStats stats={stats} />

        {/* Setup checklist (hidden once complete) */}
        <QuickActions status={userStatus} />

        {/* Recent activity */}
        <RecentActivity />

      </div>
    </>
  )
}
