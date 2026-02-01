
import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Mail } from 'lucide-react'

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
    <div className="flex flex-col gap-1 overflow-y-auto h-full pr-1">
      {items.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground text-sm flex flex-col items-center gap-3">
          <Mail className="w-10 h-10 opacity-20" />
          <div>
            <p className="font-medium">No applications yet</p>
            <p className="text-xs mt-1">Your sent applications will appear here</p>
          </div>
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex flex-col gap-1.5 p-3 rounded-md cursor-pointer transition-all border",
              selectedId === item.id
                ? "bg-accent/50 border-accent shadow-sm"
                : "bg-background border-transparent hover:bg-accent/30"
            )}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="font-semibold truncate text-sm flex-1">
                {item.job.company}
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(item.appliedAt), { addSuffix: true })}
              </span>
            </div>

            <div className="text-xs text-foreground/70 truncate">
              {item.job.title}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant={item.status === 'replied' ? 'default' : 'secondary'}
                className={cn(
                  "text-[10px] h-4 px-1.5 font-medium",
                  item.status === 'replied' && "bg-green-100 text-green-700 border-green-200"
                )}
              >
                {item.status === 'replied' ? '✓ Replied' : 'Sent'}
              </Badge>
              <span className="text-[11px] text-muted-foreground truncate flex-1">
                {item.hrEmail}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
