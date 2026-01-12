import { ScrapedPosts } from "@/components/dashboard/ScrapedPosts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Plus, Filter } from "lucide-react"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type JobMatchesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getJobMatchStats(userId: string) {
  try {
    const [
      totalMatches,
      totalApplied,
      avgMatchScoreResult,
      emailStats
    ] = await Promise.all([
      // 1. Total Matches (Actionable: contains "@" and NOT applied)
      prisma.scrapedPost.count({
        where: {
          user_id: userId,
          text: { contains: "@" },
          NOT: {
            OR: [
              {
                matches: {
                  some: {
                    user_id: userId,
                    applied: true
                  }
                }
              },
              {
                applications: {
                  some: {
                    user_id: userId
                  }
                }
              }
            ]
          }
        }
      }),
      
      // 2. Applied Count
      prisma.scrapedPost.count({
        where: {
          user_id: userId,
          // Count as applied if there's a match marked as applied OR an application record
          OR: [
            {
              matches: {
                some: {
                  user_id: userId,
                  applied: true
                }
              }
            },
            {
              applications: {
                some: {
                  user_id: userId
                }
              }
            }
          ]
        }
      }),

      // 3. Average Match Score
      prisma.scrapedPostMatch.aggregate({
        where: {
          user_id: userId
        },
        _avg: {
          match_score: true
        }
      }),
      
      // 4. Response Rate stats (Applications vs Replies)
      Promise.all([
        // Count total applications sent via email
        prisma.scrapedApplication.count({
          where: {
            user_id: userId,
            gmail_thread_id: { not: null } // Only count if email was actually sent/tracked
          }
        }),
        // Count applications that have received replies
        prisma.scrapedApplication.findMany({
          where: {
            user_id: userId,
            gmail_thread_id: { not: null }
          },
          select: {
            gmail_thread_id: true
          }
        }).then(async (apps) => {
          const threadIds = apps.map(a => a.gmail_thread_id).filter(Boolean) as string[]
          
          if (threadIds.length === 0) return 0
          
          // Count threads that have incoming messages (replies)
          // We check EmailLog for 'received' messages in these threads
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
    ])
    
    const [applicationsSent, repliesReceived] = emailStats
    const responseRate = applicationsSent > 0 
      ? Math.round((repliesReceived / applicationsSent) * 100) 
      : 0
      
    // If preference is 0-1.0 scale:
    const normalizedMatchScore = avgMatchScoreResult._avg.match_score 
      ? (avgMatchScoreResult._avg.match_score / 100).toFixed(1)
      : "0.0"

    return {
      totalMatches: totalMatches,
      totalApplied,
      responseRate,
      avgMatchScore: normalizedMatchScore
    }
  } catch (error) {
    console.error("Error fetching job match stats:", error)
    return {
      totalMatches: 0,
      totalApplied: 0,
      responseRate: 0,
      avgMatchScore: "0.0"
    }
  }
}

export default async function JobMatchesPage({ searchParams }: JobMatchesPageProps) {
  const session = await getServerSession(authOptions)
  
  const userId = (session?.user as any)?.id
  const stats = userId 
    ? await getJobMatchStats(userId) 
    : { totalMatches: 0, totalApplied: 0, responseRate: 0, avgMatchScore: "0.0" }

  const awaitedSearchParams = await searchParams
  const pageParam = awaitedSearchParams?.page
  const pageStr = Array.isArray(pageParam) ? pageParam[0] : pageParam
  const page = pageStr ? Math.max(1, parseInt(pageStr, 10) || 1) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Matches</h1>
          <p className="mt-2 text-gray-600">
            AI-matched job opportunities based on your profile and preferences.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Manual Search
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">Actionable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applied</CardTitle>
            <Badge variant="secondary" className="text-xs">Applied</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplied}</div>
            <p className="text-xs text-muted-foreground">Applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Badge variant="outline" className="text-xs">{stats.responseRate}%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate}%</div>
            <p className="text-xs text-muted-foreground">From applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Match Score</CardTitle>
            <Badge variant="secondary" className="text-xs">{stats.avgMatchScore}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMatchScore}</div>
            <p className="text-xs text-muted-foreground">Out of 1.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Job Matches Table */}
      <ScrapedPosts page={page} />
    </div>
  )
}
