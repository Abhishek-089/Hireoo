
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ExternalLink, Mail, User, Building2, Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface EmailActivityItem {
  id: string
  appliedAt: string
  hrEmail: string
  job: {
    title: string
    company: string
    url: string
  }
  status: string
  thread: any
}

interface EmailThreadViewProps {
  item: EmailActivityItem | null
}

export function EmailThreadView({ item }: EmailThreadViewProps) {
  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3">
        <Mail className="w-16 h-16 opacity-10" />
        <div className="text-center">
          <p className="font-medium">Select a conversation</p>
          <p className="text-sm mt-1 opacity-70">Choose an application to view the email thread</p>
        </div>
      </div>
    )
  }

  const messages = item.thread?.messages || []

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <h2 className="text-xl font-semibold truncate">{item.job.title}</h2>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">{item.job.company}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="w-3.5 h-3.5" />
                <span className="text-xs">{item.hrEmail}</span>
              </div>

              {item.job.url && (
                <a
                  href={item.job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Job Post
                </a>
              )}

              <Badge
                variant={item.status === 'replied' ? 'default' : 'secondary'}
                className={cn(
                  "text-xs h-5",
                  item.status === 'replied' && "bg-green-100 text-green-700 border-green-200"
                )}
              >
                {item.status === 'replied' ? '✓ Replied' : 'Sent'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No messages in this thread</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.direction === 'sent'
            const initials = isMe ? 'Me' : (item.hrEmail.substring(0, 2).toUpperCase())

            return (
              <div key={msg.id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
                <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                  <AvatarFallback className={cn(
                    "text-xs font-medium",
                    isMe ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className={cn(
                  "flex flex-col gap-1 max-w-[75%]",
                  isMe ? "items-end" : "items-start"
                )}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-foreground/80">
                      {isMe ? 'You' : item.hrEmail.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(msg.gmail_timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>

                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap break-words",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  )}>
                    {msg.body || msg.snippet}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
