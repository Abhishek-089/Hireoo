import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock } from 'lucide-react'

interface EmailActivityItem {
  id: string
  appliedAt: string
  hrEmail: string
  job: { title: string; company: string; url: string }
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
    <div className="flex flex-col divide-y divide-gray-50">
      {items.map((item) => {
        const isSelected = selectedId === item.id
        const isReplied = item.status === 'replied'
        const initials = item.job.company.slice(0, 2).toUpperCase()

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "w-full text-left px-4 py-3.5 transition-colors",
              isSelected ? "bg-indigo-50" : "hover:bg-gray-50"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={cn(
                "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold",
                isReplied ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
              )}>
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1 mb-0.5">
                  <span className={cn(
                    "text-sm font-semibold truncate",
                    isSelected ? "text-indigo-900" : "text-gray-900"
                  )}>
                    {item.job.company}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {formatDistanceToNow(new Date(item.appliedAt), { addSuffix: true })}
                  </span>
                </div>

                <p className="text-xs text-gray-500 truncate mb-1.5">{item.job.title}</p>

                <div className="flex items-center gap-1.5">
                  {isReplied ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Replied
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                      <Clock className="h-2.5 w-2.5" />
                      Awaiting reply
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
