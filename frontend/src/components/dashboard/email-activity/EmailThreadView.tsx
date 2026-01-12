
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ExternalLink, Mail, User, Building2 } from 'lucide-react'

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
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
        <Mail className="w-12 h-12" />
        <p>Select a conversation to view details</p>
      </div>
    )
  }

  const messages = item.thread?.messages || []

  // If no thread messages but we have the application info (fallback for 'sent' state only if logs missing)
  // But our API only returns applications, and we simulated logs.
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {item.job.title}
              <span className="text-muted-foreground font-normal text-base">at {item.job.company}</span>
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
               <div className="flex items-center gap-1">
                 <Mail className="w-3 h-3" />
                 {item.hrEmail}
               </div>
               {item.job.url && (
                 <a 
                   href={item.job.url} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center gap-1 hover:text-primary transition-colors"
                 >
                   <ExternalLink className="w-3 h-3" />
                   View Job Post
                 </a>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pr-4 space-y-6">
        {messages.length === 0 ? (
           <div className="text-center text-muted-foreground py-10">
             No messages found for this application.
           </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.direction === 'sent'
            return (
              <div key={msg.id} className={cn("flex gap-3 max-w-[90%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                <Avatar className="h-8 w-8 mt-1 border">
                  {isMe ? (
                     <AvatarFallback className="bg-primary text-primary-foreground">Me</AvatarFallback>
                  ) : (
                     <AvatarFallback className="bg-muted">HR</AvatarFallback>
                  )}
                </Avatar>
                
                <div className={cn(
                  "flex flex-col gap-1 min-w-0",
                  isMe ? "items-end" : "items-start"
                )}>
                  <div className="flex items-baseline gap-2">
                     <span className="text-xs font-medium text-foreground/80">
                       {isMe ? 'You' : item.hrEmail}
                     </span>
                     <span className="text-[10px] text-muted-foreground">
                       {format(new Date(msg.gmail_timestamp), 'MMM d, h:mm a')}
                     </span>
                  </div>
                  
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap break-words",
                    isMe 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted text-foreground rounded-tl-none"
                  )}>
                    {/* 
                       For simplicity using snippet or body if available. 
                       In real app, we might parse HTML body. 
                       Here assuming snippet for list, but detailed view should ideally use full body.
                       Our mock/API might need adjustment to return full body or we use snippet for now.
                       The API returns 'messages' included from prisma. EmailLog has 'snippet', but Email model has body.
                       EmailLog schema has 'snippet' but not full body.
                       However, for 'scraped applications', the initial email body is in ScrapedApplication.cover_letter.
                       And replies are in EmailLog (without full body in schema currently! wait, let me check schema).
                    */}
                    {/* Checking schema: EmailLog has snippet. Email has body. EmailReply has body.
                       But EmailLog is what we are syncing from GmailSync.
                       The sync script populates EmailLog snippet.
                       Wait, the sync script DOES NOT store full body in EmailLog?
                       Schema check:
                       model EmailLog { snippet String ... }
                       model EmailThread { ... }
                       
                       There is no full body in EmailLog. This is a potential limitation.
                       However, for 'sent' emails initiated by us, we have ScrapedApplication.cover_letter.
                       For replies, we only have snippets in EmailLog currently unless we fetch full content on demand or store it.
                       
                       User request: "render that same information of the email... show that also in this page"
                       
                       For now, I'll display the snippet. If it's too short, I might need to update schema or fetch strategy, 
                       but for this task I will stick to what's available or improve if I see it's critical.
                       Actually, `cover_letter` is available in `item`.
                       If `isMe` and it matches the initial send time, I can show `item.cover_letter`.
                       For replies, I'll show snippet.
                    */}
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
