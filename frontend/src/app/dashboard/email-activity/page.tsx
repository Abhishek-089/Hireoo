'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { EmailList } from '@/components/dashboard/email-activity/EmailList'
import { EmailThreadView } from '@/components/dashboard/email-activity/EmailThreadView'
import { Loader2, RefreshCw, Mail } from 'lucide-react'

const AUTO_REFRESH_MS = 60_000

export default function EmailActivityPage() {
  const [items, setItems] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEmailActivity = useCallback(async (opts?: { silent?: boolean; sync?: boolean }) => {
    const silent = opts?.silent ?? false
    const sync = opts?.sync ?? false
    const url = sync
      ? '/api/dashboard/email-activity?sync=1'
      : '/api/dashboard/email-activity'
    try {
      if (!silent) setLoading(true)
      setError(null)
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch data')
      const data = await res.json()
      setItems(data)
      setSelectedId((prev) => {
        if (!data.length) return null
        if (!prev) return data[0].id
        if (!data.some((i: { id: string }) => i.id === prev)) return data[0].id
        return prev
      })
    } catch (err) {
      if (!silent) setError('Failed to load email activity.')
      console.error(err)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEmailActivity()
    // Pull Gmail after first paint (DB-only response is fast; this updates replies in the background)
    const bg = setTimeout(() => void loadEmailActivity({ silent: true, sync: true }), 250)
    return () => clearTimeout(bg)
  }, [loadEmailActivity])

  useEffect(() => {
    // Poll DB only — avoids 30+ Gmail calls every minute
    const id = setInterval(() => void loadEmailActivity({ silent: true, sync: false }), AUTO_REFRESH_MS)
    return () => clearInterval(id)
  }, [loadEmailActivity])

  const selectedItem = items.find(i => i.id === selectedId) || null
  const repliedCount = items.filter(i => i.status === 'replied').length

  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-3.5rem)]">

      {/* Page header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your applications and conversations with recruiters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <span className="text-gray-500"><span className="font-semibold text-gray-900">{items.length}</span> sent</span>
              <span className="text-gray-500"><span className="font-semibold text-emerald-600">{repliedCount}</span> replied</span>
            </div>
          )}
          <button
            onClick={() => void loadEmailActivity({ sync: true })}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="flex-1 flex items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-sm text-red-600">
          {error}
        </div>
      ) : loading && items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-gray-300" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No applications yet</p>
          <p className="text-xs text-gray-400 mt-1">Applications you send will appear here.</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
          {/* List panel */}
          <div className="md:col-span-4 lg:col-span-3 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 shrink-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Applications</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <EmailList items={items} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </div>

          {/* Thread panel */}
          <div className="md:col-span-8 lg:col-span-9 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
            <EmailThreadView item={selectedItem} />
          </div>
        </div>
      )}
    </div>
  )
}
