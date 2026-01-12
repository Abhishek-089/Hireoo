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

  let rawPosts: Array<{
    id: string
    text: string
    post_url: string
    created_at: Date
    matches: Array<{
      match_score: number
      match_quality: string
      matched_at: Date
      applied: boolean
      applied_at: Date | null
    }>
    applications: Array<{
      id: string
      sent_at: Date
      gmail_thread_id: string | null
      hr_email: string | null
    }>
  }> = []
  let rawAppliedPosts: Array<{
    id: string
    text: string
    post_url: string
    created_at: Date
    matches: Array<{
      match_score: number
      match_quality: string
      matched_at: Date
      applied: boolean
      applied_at: Date | null
    }>
    applications: Array<{
      id: string
      sent_at: Date
      gmail_thread_id: string | null
      hr_email: string | null
    }>
  }> = []
  let totalCount = 0
  try {
    const baseWhere: any = {
      user_id: (session.user as any).id,
      // quick pre-filter: only posts whose text contains '@'
      text: { contains: "@" },
    }

    const [rows, count, appliedRows] = await Promise.all([
      // Get non-applied posts
      prisma.scrapedPost.findMany({
        where: {
          ...baseWhere,
          NOT: {
            OR: [
              {
                matches: {
                  some: {
                    user_id: (session.user as any).id,
                    applied: true,
                  },
                },
              },
              {
                applications: {
                  some: {
                    user_id: (session.user as any).id,
                  },
                },
              },
            ],
          },
        },
        include: {
          matches: {
            where: {
              user_id: (session.user as any).id,
            },
            select: {
              match_score: true,
              match_quality: true,
              matched_at: true,
              applied: true,
              applied_at: true,
            },
            take: 1,
          },
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
        },
        orderBy: { created_at: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.scrapedPost.count({
        where: {
          ...baseWhere,
          NOT: {
            OR: [
              {
                matches: {
                  some: {
                    user_id: (session.user as any).id,
                    applied: true,
                  },
                },
              },
              {
                applications: {
                  some: {
                    user_id: (session.user as any).id,
                  },
                },
              },
            ],
          },
        },
      }),
      // Get applied posts
      prisma.scrapedPost.findMany({
        where: {
          ...baseWhere,
          OR: [
            {
              matches: {
                some: {
                  user_id: (session.user as any).id,
                  applied: true,
                },
              },
            },
            {
              applications: {
                some: {
                  user_id: (session.user as any).id,
                },
              },
            },
          ],
        },
        include: {
          matches: {
            where: {
              user_id: (session.user as any).id,
            },
            select: {
              match_score: true,
              match_quality: true,
              matched_at: true,
              applied: true,
              applied_at: true,
            },
            take: 1,
          },
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
        },
        orderBy: { created_at: "desc" },
        take: 20, // Show up to 20 applied posts
      }),
    ])

    rawPosts = rows
    rawAppliedPosts = appliedRows
    totalCount = count
  } catch (error) {
    console.error("ScrapedPosts failed to load from database:", error)
    rawPosts = []
    rawAppliedPosts = []
    totalCount = 0
  }

  // Process non-applied posts
  const posts = rawPosts
    .map((post) => {
      const emails = extractEmails(post.text || "")
      const match = post.matches[0]
      return {
        id: post.id,
        text: post.text,
        postUrl: post.post_url,
        emails,
        createdAt: post.created_at.toISOString(),
        matchScore: match?.match_score ?? null,
        matchQuality: match?.match_quality ?? null,
        applied: false,
      }
    })
    // Show all posts, not just ones with emails
    // .filter((post) => post.emails.length > 0)

  // Process applied posts and fetch email replies
  const appliedPostsWithReplies = await Promise.all(
    rawAppliedPosts.map(async (post) => {
      const emails = extractEmails(post.text || "")
      const match = post.matches[0]
      const application = post.applications[0]
      
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
          // Find email logs for this thread that are replies (received messages)
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
            take: 5, // Get up to 5 most recent replies
          })
          
          replies = emailLogs.map(log => ({
            id: log.id,
            from_email: log.from_email,
            subject: log.subject,
            body_text: log.snippet || '',
            received_at: log.sent_at,
            is_read: false, // EmailLog doesn't have is_read, but we can add it later
          }))
        } catch (error) {
          console.error('Error fetching email replies:', error)
        }
      }
      
      return {
        id: post.id,
        text: post.text,
        postUrl: post.post_url,
        emails,
        createdAt: post.created_at.toISOString(),
        matchScore: match?.match_score ?? null,
        matchQuality: match?.match_quality ?? null,
        applied: true,
        appliedAt: match?.applied_at || application?.sent_at || null,
        applicationId: application?.id || null,
        hrEmail: application?.hr_email || null,
        threadId: application?.gmail_thread_id || null,
        replies: replies,
        hasReplies: replies.length > 0,
      }
    })
  )
  
  // Show all applied posts, not just ones with emails
  const appliedPosts = appliedPostsWithReplies
  // .filter((post) => post.emails.length > 0)

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

