
import { ScrapedPostsClient } from "./ScrapedPostsClient"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function extractEmails(text: string): string[] {
  const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
  const matches = text.match(regex)
  return matches ? Array.from(new Set(matches)) : []
}

export async function ScrapedPosts({ page = 1 }: { page?: number }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const pageSize = 10
  const currentPage = page < 1 ? 1 : page

  let rawPosts: any[] = []
  let rawAppliedPosts: any[] = []
  let totalCount = 0

  try {
    // Get user's daily limit reset time to filter posts shown today
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { daily_limit_reset_at: true }
    })

    // Calculate the start of today's limit window
    // If reset time exists and is in the future, use the previous reset (24h ago)
    // Otherwise use the current reset time
    const now = new Date()
    let limitWindowStart: Date

    if (user?.daily_limit_reset_at && user.daily_limit_reset_at > now) {
      // Reset time is in the future, so we're in the current window
      // Window started 24 hours before the next reset
      limitWindowStart = new Date(user.daily_limit_reset_at.getTime() - 24 * 60 * 60 * 1000)
    } else {
      // No reset time or it's passed, use a safe default (start of today in IST)
      const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
      const nowIST = new Date(now.getTime() + IST_OFFSET_MS)
      const year = nowIST.getUTCFullYear()
      const month = nowIST.getUTCMonth()
      const day = nowIST.getUTCDate()
      const todayMidnightIST = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
      limitWindowStart = new Date(todayMidnightIST.getTime() - IST_OFFSET_MS)
    }

    const [rows, count, appliedRows] = await Promise.all([
      // Get matched posts shown today (within daily limit)
      prisma.scrapedPostMatch.findMany({
        where: {
          user_id: (session.user as any).id,
          applied: false,
          shown_to_user: true,  // Only posts that were shown
          shown_at: {
            gte: limitWindowStart  // Only posts shown in current limit window
          }
        },
        include: {
          scrapedPost: {
            include: {
              job: true
            }
          }
        },
        orderBy: { shown_at: "desc" },  // Most recently shown first
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),

      // Count total matches shown today
      prisma.scrapedPostMatch.count({
        where: {
          user_id: (session.user as any).id,
          applied: false,
          shown_to_user: true,
          shown_at: {
            gte: limitWindowStart
          }
        },
      }),

      // Get applied matches (no time limit on these)
      prisma.scrapedPostMatch.findMany({
        where: {
          user_id: (session.user as any).id,
          applied: true,
        },
        include: {
          scrapedPost: {
            include: {
              job: true,
              applications: {
                where: {
                  user_id: (session.user as any).id,
                },
                select: {
                  id: true,
                  sent_at: true,
                  gmail_thread_id: true,
                  hr_email: true,
                },
                orderBy: { sent_at: "desc" },
                take: 1,
              },
            }
          }
        },
        orderBy: { applied_at: "desc" },
        take: 20,
      }),
    ])

    // Helper to map match to post structure
    const mapMatchToPost = (match: any) => ({
      id: match.scrapedPost.id,
      text: match.text_content || match.scrapedPost.text,
      post_url: match.scrapedPost.post_url,
      created_at: match.scrapedPost.created_at,
      match_score: match.match_score,
      match_quality: match.match_quality,
      matched_at: match.matched_at,
      applied: match.applied,
      applied_at: match.applied_at,
      job: match.scrapedPost.job,
      applications: match.scrapedPost.applications || []
    });

    rawPosts = rows.map(mapMatchToPost)
    rawAppliedPosts = appliedRows.map(mapMatchToPost)
    totalCount = count

  } catch (error) {
    console.error("ScrapedPosts failed to load from database:", error)
    rawPosts = []
    rawAppliedPosts = []
    totalCount = 0
  }

  // Helper to format post with job data if available
  const enrichPost = (post: any) => {
    // Check if we have enriched job data
    const job = post.job;
    const isEnriched = !!job;

    return {
      id: post.id,
      text: post.text || "",
      postUrl: post.post_url,
      emails: extractEmails(post.text || ""),
      createdAt: post.created_at.toISOString(),
      matchScore: post.match_score ?? null,
      matchQuality: post.match_quality ?? null,
      applied: post.applied === true,
      appliedAt: post.applied_at,
      isEnriched: isEnriched,
      jobData: job ? {
        title: job.title,
        company: job.company,
        location: job.location,
        skills: job.skills,
        salary: job.salary_range,
        postedDate: job.posted_date?.toISOString(),
        description: job.description
      } : null
    };
  }

  // Process non-applied posts
  const posts = rawPosts.map((post: any) => {
    return enrichPost(post);
  })

  // Process applied posts
  const appliedPosts = await Promise.all(
    rawAppliedPosts.map(async (post: any) => {
      const enriched = enrichPost(post);
      const application = post.applications[0];

      // Fetch email replies if thread_id exists
      let replies: Array<{
        id: string
        from_email: string
        subject: string
        body_text: string
        received_at: Date
        is_read: boolean
      }> = []

      if (application?.gmail_thread_id) {
        try {
          const emailLogs = await prisma.emailLog.findMany({
            where: {
              user_id: (session.user as any).id,
              thread_id: application.gmail_thread_id,
              direction: 'received',
              is_reply: true,
            },
            select: {
              id: true,
              from_email: true,
              subject: true,
              snippet: true,
              sent_at: true,
            },
            orderBy: { sent_at: 'desc' },
            take: 5,
          })

          replies = emailLogs.map((log: any) => ({
            id: log.id,
            from_email: log.from_email,
            subject: log.subject,
            body_text: log.snippet || '',
            received_at: log.sent_at,
            is_read: false,
          }))
        } catch (error) {
          console.error('Error fetching email replies:', error)
        }
      }

      return {
        ...enriched,
        applied: true,
        appliedAt: post.applied_at || application?.sent_at || null,
        applicationId: application?.id || null,
        hrEmail: application?.hr_email || null,
        threadId: application?.gmail_thread_id || null,
        replies: replies,
        hasReplies: replies.length > 0
      }
    })
  )

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1
  const showingFrom =
    totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingTo = totalCount === 0 ? 0 : showingFrom + posts.length - 1

  return (
    <>
      <ScrapedPostsClient
        posts={posts}
        title="Job Matches"
        pagination={{
          currentPage,
          totalPages,
          showingFrom,
          showingTo,
          totalCount,
        }}
      />
      {appliedPosts.length > 0 && (
        <ScrapedPostsClient
          posts={appliedPosts}
          pagination={{
            currentPage: 1,
            totalPages: 1,
            showingFrom: 1,
            showingTo: appliedPosts.length,
            totalCount: appliedPosts.length,
          }}
          title="Already Applied"
          showAppliedBadge={true}
        />
      )}
    </>
  )
}
