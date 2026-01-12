import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Send, Inbox, Activity } from "lucide-react"

interface DashboardStats {
  jobMatches: number
  emailsSent: number
  repliesReceived: number
  responseRate: number
}

function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
}: {
  title: string
  value: number | string
  subtext: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  )
}

export function OverviewStats({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Actionable Matches"
        value={stats.jobMatches}
        subtext="Waiting for review"
        icon={Briefcase}
      />
      <StatCard
        title="Emails Sent"
        value={stats.emailsSent}
        subtext="Applications sent"
        icon={Send}
      />
      <StatCard
        title="Replies"
        value={stats.repliesReceived}
        subtext="Responses received"
        icon={Inbox}
      />
      <StatCard
        title="Response Rate"
        value={`${stats.responseRate}%`}
        subtext="Engagement score"
        icon={Activity}
      />
    </div>
  )
}
