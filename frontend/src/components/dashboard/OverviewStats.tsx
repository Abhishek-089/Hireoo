import { Briefcase, Send, Inbox, TrendingUp, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  jobMatches: number
  emailsSent: number
  repliesReceived: number
  responseRate: number
}

const statConfig = [
  {
    key: "jobMatches" as const,
    label: "Job Matches",
    subtext: "Waiting for review",
    icon: Briefcase,
    href: "/dashboard/job-matches",
    gradient: "from-indigo-500/15 to-indigo-600/5",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600",
    valueColor: "text-indigo-700",
    border: "border-indigo-100",
  },
  {
    key: "emailsSent" as const,
    label: "Emails Sent",
    subtext: "Applications sent",
    icon: Send,
    href: "/dashboard/email-activity",
    gradient: "from-sky-500/15 to-sky-600/5",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600",
    valueColor: "text-sky-700",
    border: "border-sky-100",
  },
  {
    key: "repliesReceived" as const,
    label: "Replies",
    subtext: "Responses received",
    icon: Inbox,
    href: "/dashboard/email-activity",
    gradient: "from-emerald-500/15 to-emerald-600/5",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-700",
    border: "border-emerald-100",
  },
  {
    key: "responseRate" as const,
    label: "Response Rate",
    subtext: "Engagement score",
    icon: TrendingUp,
    href: "/dashboard/email-activity",
    gradient: "from-violet-500/15 to-violet-600/5",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
    valueColor: "text-violet-700",
    border: "border-violet-100",
  },
]

export function OverviewStats({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfig.map((cfg) => {
        const raw = stats[cfg.key]
        const display = cfg.key === "responseRate" ? `${raw}%` : raw

        return (
          <Link
            key={cfg.key}
            href={cfg.href}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.gradient} border ${cfg.border} p-5 hover:shadow-md transition-all hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${cfg.iconBg}`}>
                <cfg.icon className={`h-5 w-5 ${cfg.iconColor}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </div>
            <div className={`text-3xl font-bold ${cfg.valueColor} mb-1`}>{display}</div>
            <div className="text-sm font-medium text-gray-700">{cfg.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{cfg.subtext}</div>
          </Link>
        )
      })}
    </div>
  )
}
