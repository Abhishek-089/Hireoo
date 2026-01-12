import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Inbox, Star, Clock } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface ActivityItem {
  id: string
  type: 'email_sent' | 'reply_received' | 'match_found'
  title: string
  subtitle: string
  date: Date
  actions: { label: string; href: string; primary?: boolean }[]
}

async function getRecentActivity(userId: string): Promise<ActivityItem[]> {
  try {
    const [applications, replies, latestMatches] = await Promise.all([
      // 1. Recent Applications (Emails Sent)
      prisma.scrapedApplication.findMany({
        where: { user_id: userId, gmail_thread_id: { not: null } },
        orderBy: { sent_at: 'desc' },
        take: 5,
        include: { 
          scrapedPost: {
            include: { job: true }
          } 
        }
      }),
      // 2. Recent Replies (incoming emails)
      prisma.emailLog.findMany({
        where: { 
          user_id: userId, 
          direction: 'received',
          is_reply: true 
        },
        orderBy: { sent_at: 'desc' },
        take: 5
      }),
      // 3. New High Quality Matches
      prisma.scrapedPost.findMany({
        where: { 
          user_id: userId, 
          matches: { 
            some: { 
              user_id: userId, 
              match_score: { gte: 80 }
            } 
          }
        },
        orderBy: { created_at: 'desc' },
        take: 5,
        include: { 
          matches: {
            where: { user_id: userId }
          },
          job: true
        }
      })
    ])

    const activities: ActivityItem[] = []

    // Map Applications
    applications.forEach(app => {
      let subtitle = `Sent email to ${app.hr_email}`
      if (app.scrapedPost.job?.company && app.scrapedPost.job?.title) {
        subtitle = `Applied for ${app.scrapedPost.job.title} at ${app.scrapedPost.job.company}`
      } else if (app.scrapedPost.job?.company) {
        subtitle = `Applied to ${app.scrapedPost.job.company}`
      }

      const actions = [
        { label: "View Post", href: app.scrapedPost.post_url, primary: false }
      ]
      
      if (app.gmail_thread_id) {
        actions.unshift({ 
          label: "Check Email", 
          href: `https://mail.google.com/mail/u/0/#inbox/${app.gmail_thread_id}`,
          primary: true
        })
      }

      activities.push({
        id: `app-${app.id}`,
        type: 'email_sent',
        title: "Application Sent",
        subtitle: subtitle,
        date: app.sent_at,
        actions: actions
      })
    })

    // Map Replies
    replies.forEach(reply => {
      activities.push({
        id: `reply-${reply.id}`,
        type: 'reply_received',
        title: "New Reply Received",
        subtitle: reply.snippet || "You received a response",
        date: reply.sent_at,
        actions: [
          { 
            label: "View Thread", 
            href: reply.thread_id ? `https://mail.google.com/mail/u/0/#inbox/${reply.thread_id}` : '#',
            primary: true 
          }
        ]
      })
    })

    // Map Matches
    latestMatches.forEach(post => {
      if (post.matches[0]) {
        let subtitle = `${post.matches[0].match_score}% Match Score`
        if (post.job?.company) {
          subtitle = `${post.job.title || 'Job'} at ${post.job.company} • ${post.matches[0].match_score}% Match`
        }

        activities.push({
          id: `match-${post.id}`,
          type: 'match_found',
          title: "High Match Found",
          subtitle: subtitle,
          date: post.created_at,
          actions: [
            { label: "View Match", href: `/dashboard/job-matches`, primary: true }
          ]
        })
      }
    })

    // Sort combined list by date desc and take top 5
    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)

  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

// Helper functions
function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'email_sent':
      return <div className="p-2 rounded-full bg-blue-100"><Send className="h-4 w-4 text-blue-600" /></div>
    case 'reply_received':
      return <div className="p-2 rounded-full bg-green-100"><Inbox className="h-4 w-4 text-green-600" /></div>
    case 'match_found':
      return <div className="p-2 rounded-full bg-orange-100"><Star className="h-4 w-4 text-orange-600" /></div>
    default:
      return <div className="p-2 rounded-full bg-gray-100"><Clock className="h-4 w-4 text-gray-600" /></div>
  }
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return date.toLocaleDateString()
}

export async function RecentActivity() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id // Type assertion to access id
  
  if (!userId) return null
  
  const activities = await getRecentActivity(userId)

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activity. Start applying to jobs!
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <ActivityIcon type={activity.type} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <span className="text-xs text-gray-500">{formatTimeAgo(activity.date)}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{activity.subtitle}</p>
                  
                  {activity.actions.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-1">
                      {activity.actions.map((action, i) => (
                        <Link 
                          key={i} 
                          href={action.href} 
                          target={action.href.startsWith('http') ? '_blank' : undefined}
                          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                            action.primary 
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
