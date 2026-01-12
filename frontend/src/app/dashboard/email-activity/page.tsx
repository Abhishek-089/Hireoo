
'use client'

import React, { useEffect, useState } from 'react'
import { EmailList } from '@/components/dashboard/email-activity/EmailList'
import { EmailThreadView } from '@/components/dashboard/email-activity/EmailThreadView'
import { Card } from '@/components/ui/card'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EmailActivityPage() {
  const [items, setItems] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard/email-activity')
      if (!res.ok) throw new Error('Failed to fetch data')
      const data = await res.json()
      setItems(data)
      
      // Select first item by default if available and nothing selected
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
      }
    } catch (err) {
      setError('Failed to load email activity.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const selectedItem = items.find(i => i.id === selectedId) || null

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4 p-4 md:p-8 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Activity</h1>
          <p className="text-muted-foreground mt-1">
             Track your applications and conversations with HRs.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      ) : loading && items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 h-full overflow-hidden">
          {/* List View */}
          <Card className="md:col-span-4 lg:col-span-3 h-full overflow-hidden flex flex-col p-2 bg-card/50 backdrop-blur-sm">
             <EmailList 
               items={items} 
               selectedId={selectedId} 
               onSelect={setSelectedId} 
             />
          </Card>

          {/* Thread View */}
          <Card className="md:col-span-8 lg:col-span-9 h-full overflow-hidden p-6 shadow-sm">
            <EmailThreadView item={selectedItem} />
          </Card>
        </div>
      )}
    </div>
  )
}
