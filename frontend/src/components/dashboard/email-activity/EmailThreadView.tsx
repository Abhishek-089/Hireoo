import React from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ExternalLink, Mail, Building2, Briefcase, CheckCircle2, Clock, MessageSquare } from 'lucide-react'

interface EmailActivityItem {
  id: string
  appliedAt: string
  hrEmail: string
  job: { title: string; company: string; url: string }
  status: string
  thread: any
}

export function EmailThreadView({ item }: { item: EmailActivityItem | null }) {
  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-600">Select a conversation</p>
        <p className="text-xs text-gray-400 mt-1">Pick an application from the left to view the thread</p>
      </div>
    )
  }

  const messages = item.thread?.messages || []
  const isReplied = item.status === 'replied'

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Thread header */}
      <div className="px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
              <h2 className="text-base font-bold text-gray-900 truncate">{item.job.title}</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium text-gray-700">{item.job.company}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Mail className="w-3 h-3" />
                {item.hrEmail}
              </span>
              {item.job.url && (
                <a href={item.job.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  <ExternalLink className="w-3 h-3" />
                  View post
                </a>
              )}
            </div>
          </div>
          {isReplied ? (
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Replied
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-sky-100 text-sky-700">
              <Clock className="w-3.5 h-3.5" />
              Awaiting reply
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">No messages in this thread yet</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.direction === 'sent'
            const senderName = isMe ? 'You' : item.hrEmail.split('@')[0]
            const initials = isMe ? 'Me' : item.hrEmail.slice(0, 2).toUpperCase()

            return (
              <div key={msg.id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
                {/* Avatar */}
                <div className={cn(
                  "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mt-1",
                  isMe ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                )}>
                  {initials}
                </div>

                <div className={cn("flex flex-col gap-1 max-w-[72%]", isMe ? "items-end" : "items-start")}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-gray-700">{senderName}</span>
                    <span className="text-[10px] text-gray-400">
                      {format(new Date(msg.gmail_timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className={cn(
                    "px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm",
                    isMe
                      ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm"
                      : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
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
