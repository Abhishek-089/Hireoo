import { ScrapedPosts } from "@/components/dashboard/ScrapedPosts"
import { JobMatchesLoader } from "@/components/dashboard/JobMatchesLoader"
import { Briefcase, Send, TrendingUp, Star } from "lucide-react"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ScrapedPostMatchingService } from "@/lib/scraped-post-matching"

type JobMatchesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getJobMatchStats(userId: string) {
  try {
    const allTimeShownFilter = {
      user_id: userId,
      shown_to_user: true,
      scrapedPost: { text: { contains: '@' } },
    }

    const [totalMatches, totalApplied, avgMatchScoreResult, emailStats] = await Promise.all([
      prisma.scrapedPostMatch.count({
        where: {
          ...allTimeShownFilter,
          applied: false,
          scrapedPost: {
            text: { contains: '@' },
            applications: { none: { user_id: userId } }
          }
        }
      }),
      prisma.scrapedPostMatch.count({
        where: {
          ...allTimeShownFilter,
          OR: [
            { applied: true },
            { scrapedPost: { applications: { some: { user_id: userId } } } }
          ]
        }
      }),
      prisma.scrapedPostMatch.aggregate({
        where: allTimeShownFilter,
        _avg: { match_score: true }
      }),
      Promise.all([
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
    ])

    const [applicationsSent, repliesReceived] = emailStats
    const responseRate = applicationsSent > 0
      ? Math.round((repliesReceived / applicationsSent) * 100)
      : 0

    const avgScore = avgMatchScoreResult._avg.match_score
      ? Math.round(avgMatchScoreResult._avg.match_score)
      : 0

    return { totalMatches, totalApplied, responseRate, avgScore }
  } catch (error) {
    console.error("Error fetching job match stats:", error)
    return { totalMatches: 0, totalApplied: 0, responseRate: 0, avgScore: 0 }
  }
}

export default async function JobMatchesPage({ searchParams }: JobMatchesPageProps) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return <div>Please sign in to view job matches.</div>

  const awaitedSearchParams = await searchParams
  const pageParam = awaitedSearchParams?.page
  const pageStr = Array.isArray(pageParam) ? pageParam[0] : pageParam
  const page = pageStr ? Math.max(1, parseInt(pageStr, 10) || 1) : 1
  const fromOnboarding = awaitedSearchParams?.from === "onboarding"

  try {
    await ScrapedPostMatchingService.fillFromGlobalPool(userId)
  } catch (e) {
    console.error("Pool fill error:", e)
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { skills: true },
  })
  const keyword = user?.skills?.[0] || ""

  const stats = await getJobMatchStats(userId)

  const content = (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Matched Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">
          AI-matched opportunities based on your profile and skills.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Open Matches",
            value: stats.totalMatches,
            sub: "Ready to apply",
            icon: Briefcase,
            gradient: "from-indigo-500/15 to-indigo-600/5",
            iconBg: "bg-indigo-500/10",
            iconColor: "text-indigo-600",
            valueColor: "text-indigo-700",
            border: "border-indigo-100",
          },
          {
            label: "Applied",
            value: stats.totalApplied,
            sub: "Applications sent",
            icon: Send,
            gradient: "from-sky-500/15 to-sky-600/5",
            iconBg: "bg-sky-500/10",
            iconColor: "text-sky-600",
            valueColor: "text-sky-700",
            border: "border-sky-100",
          },
          {
            label: "Response Rate",
            value: `${stats.responseRate}%`,
            sub: "From sent emails",
            icon: TrendingUp,
            gradient: "from-emerald-500/15 to-emerald-600/5",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-600",
            valueColor: "text-emerald-700",
            border: "border-emerald-100",
          },
          {
            label: "Avg. Match Score",
            value: `${stats.avgScore}%`,
            sub: "Across all matches",
            icon: Star,
            gradient: "from-amber-500/15 to-amber-600/5",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
            valueColor: "text-amber-700",
            border: "border-amber-100",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} border ${card.border} p-5`}
          >
            <div className={`inline-flex p-2.5 rounded-xl ${card.iconBg} mb-3`}>
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div className={`text-3xl font-bold ${card.valueColor} mb-1`}>{card.value}</div>
            <div className="text-sm font-medium text-gray-700">{card.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Job list */}
      <ScrapedPosts page={page} />
    </div>
  )

  if (fromOnboarding) {
    return <JobMatchesLoader keyword={keyword}>{content}</JobMatchesLoader>
  }

  return content
}
