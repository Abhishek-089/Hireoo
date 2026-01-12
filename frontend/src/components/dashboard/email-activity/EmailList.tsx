
import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

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

interface EmailListProps {
  items: EmailActivityItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function EmailList({ items, selectedId, onSelect }: EmailListProps) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto h-full pr-2">
      {items.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground text-sm">
          No email activity found.
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50",
              selectedId === item.id 
                ? "bg-muted border-primary/50 shadow-sm" 
                : "bg-card border-border"
            )}
          >
            <div className="flex justify-between items-start">
              <div className="font-semibold truncate pr-2 text-sm">{item.job.company}</div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(item.appliedAt), { addSuffix: true })}
              </span>
            </div>
            
            <div className="text-xs font-medium text-foreground/80 truncate">
              {item.job.title}
            </div>

            <div className="flex items-center gap-2 mt-1">
               <Badge variant={item.status === 'replied' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5">
                  {item.status === 'replied' ? 'Replied' : 'Sent'}
               </Badge>
               <span className="text-xs text-muted-foreground truncate flex-1">
                 {item.hrEmail}
               </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
