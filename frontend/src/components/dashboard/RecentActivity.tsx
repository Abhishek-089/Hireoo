import { Send, Inbox, Star, ArrowUpRight } from "lucide-react"
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
      prisma.scrapedApplication.findMany({
        where: { user_id: userId, gmail_thread_id: { not: null } },
        orderBy: { sent_at: 'desc' },
        take: 5,
        include: { scrapedPost: { include: { job: true } } }
      }),
      prisma.emailLog.findMany({
        where: { user_id: userId, direction: 'received', is_reply: true },
        orderBy: { sent_at: 'desc' },
        take: 5
      }),
      prisma.scrapedPostMatch.findMany({
        where: { user_id: userId, match_score: { gte: 80 } },
        orderBy: { matched_at: 'desc' },
        take: 5,
        include: { scrapedPost: { include: { job: true } } }
      })
    ])

    const activities: ActivityItem[] = []

    applications.forEach((app: any) => {
      let subtitle = `Sent email to ${app.hr_email}`
      if (app.scrapedPost.job?.company && app.scrapedPost.job?.title) {
        subtitle = `${app.scrapedPost.job.title} at ${app.scrapedPost.job.company}`
      } else if (app.scrapedPost.job?.company) {
        subtitle = `Applied to ${app.scrapedPost.job.company}`
      }
      const actions = [{ label: "View Post", href: app.scrapedPost.post_url, primary: false }]
      if (app.gmail_thread_id) {
        actions.unshift({ label: "View Email", href: `https://mail.google.com/mail/u/0/#inbox/${app.gmail_thread_id}`, primary: true })
      }
      activities.push({ id: `app-${app.id}`, type: 'email_sent', title: "Application Sent", subtitle, date: app.sent_at, actions })
    })

    replies.forEach((reply: any) => {
      activities.push({
        id: `reply-${reply.id}`,
        type: 'reply_received',
        title: "Reply Received",
        subtitle: reply.snippet || "You received a response",
        date: reply.sent_at,
        actions: [{ label: "View Thread", href: reply.thread_id ? `https://mail.google.com/mail/u/0/#inbox/${reply.thread_id}` : '#', primary: true }]
      })
    })

    latestMatches.forEach((match: any) => {
      const post = match.scrapedPost
      if (post) {
        const subtitle = post.job?.company
          ? `${post.job.title || 'Job'} at ${post.job.company} · ${match.match_score}% match`
          : `${match.match_score}% match score`
        activities.push({
          id: `match-${post.id}`,
          type: 'match_found',
          title: "High Match Found",
          subtitle,
          date: match.matched_at,
          actions: [{ label: "Review", href: `/dashboard/job-matches`, primary: true }]
        })
      }
    })

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

function formatTimeAgo(date: Date) {
  const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (diffInSeconds < 60) return 'Just now'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}

const typeConfig = {
  email_sent: {
    icon: Send,
    bg: "bg-sky-100",
    iconColor: "text-sky-600",
    dot: "bg-sky-400",
  },
  reply_received: {
    icon: Inbox,
    bg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    dot: "bg-emerald-400",
  },
  match_found: {
    icon: Star,
    bg: "bg-amber-100",
    iconColor: "text-amber-600",
    dot: "bg-amber-400",
  },
}

export async function RecentActivity() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) return null

  const activities = await getRecentActivity(userId)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
        <Link
          href="/dashboard/email-activity"
          className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
        >
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <Send className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No activity yet</p>
          <p className="text-xs text-gray-400 mt-1">Your applications and replies will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {activities.map((activity) => {
            const cfg = typeConfig[activity.type]
            return (
              <li key={activity.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                {/* Icon */}
                <div className={`shrink-0 p-2 rounded-xl ${cfg.bg}`}>
                  <cfg.icon className={`h-4 w-4 ${cfg.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                    <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">{formatTimeAgo(activity.date)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.subtitle}</p>

                  {activity.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activity.actions.map((action, i) => (
                        <Link
                          key={i}
                          href={action.href}
                          target={action.href.startsWith('http') ? '_blank' : undefined}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                            action.primary
                              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
