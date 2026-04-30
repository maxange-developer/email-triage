'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getBrowserClient } from '@/lib/supabase/client'
import { initialSync, markHandledAction } from '@/app/app/actions'
import { type EmailRow } from '@/lib/validations/email'
import PriorityGroup from '@/components/inbox/PriorityGroup'
import EmailCard from '@/components/inbox/EmailCard'

interface GroupedEmails {
  high: EmailRow[]
  medium: EmailRow[]
  low: EmailRow[]
}

interface InboxViewProps {
  initialEmails: GroupedEmails
  userId: string
}

export default function InboxView({ initialEmails, userId }: InboxViewProps) {
  const [grouped, setGrouped] = useState<GroupedEmails>(initialEmails)
  const [search, setSearch] = useState('')
  const [syncing, startSyncTransition] = useTransition()

  // Realtime subscription
  useEffect(() => {
    const channel = getBrowserClient()
      .channel('emails-inbox')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as EmailRow
          if (!row || row.is_handled) {
            // Remove from all groups
            setGrouped((prev) => ({
              high: prev.high.filter((e) => e.id !== row?.id),
              medium: prev.medium.filter((e) => e.id !== row?.id),
              low: prev.low.filter((e) => e.id !== row?.id),
            }))
            return
          }
          setGrouped((prev) => {
            // Remove from all groups first (handles priority change on UPDATE)
            const without: GroupedEmails = {
              high: prev.high.filter((e) => e.id !== row.id),
              medium: prev.medium.filter((e) => e.id !== row.id),
              low: prev.low.filter((e) => e.id !== row.id),
            }
            // Add to correct group if priority is set and not spam
            if (row.priority === 'high') return { ...without, high: [row, ...without.high] }
            if (row.priority === 'medium') return { ...without, medium: [row, ...without.medium] }
            if (row.priority === 'low') return { ...without, low: [row, ...without.low] }
            return without
          })
        },
      )
      .subscribe()

    return () => {
      getBrowserClient().removeChannel(channel)
    }
  }, [userId])

  function handleHandled(id: string) {
    setGrouped((prev) => ({
      high: prev.high.filter((e) => e.id !== id),
      medium: prev.medium.filter((e) => e.id !== id),
      low: prev.low.filter((e) => e.id !== id),
    }))
  }

  function handleSync() {
    startSyncTransition(async () => {
      await initialSync()
    })
  }

  // Flat filtered list for search
  const filteredEmails = useMemo<EmailRow[]>(() => {
    if (!search.trim()) return []
    const term = search.toLowerCase()
    const all = [...grouped.high, ...grouped.medium, ...grouped.low]
    return all.filter(
      (e) =>
        e.subject?.toLowerCase().includes(term) ||
        e.from_name?.toLowerCase().includes(term) ||
        e.from_address?.toLowerCase().includes(term) ||
        e.ai_summary?.toLowerCase().includes(term) ||
        e.snippet?.toLowerCase().includes(term),
    )
  }, [search, grouped])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <h1 className="text-lg font-semibold shrink-0">Inbox</h1>
        <Input
          placeholder="Cerca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          aria-label="Cerca email"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          aria-label={syncing ? 'Sincronizzazione in corso' : 'Sincronizza email'}
        >
          {syncing ? 'Sincronizzazione...' : 'Sync'}
        </Button>
      </header>

      {/* Body */}
      <main className="px-4 py-4 max-w-2xl mx-auto space-y-2">
        {search.trim() ? (
          // Flat filtered search results
          <section aria-label="Risultati ricerca">
            {filteredEmails.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nessun risultato per &ldquo;{search}&rdquo;
              </p>
            ) : (
              <div className="space-y-2">
                {filteredEmails.map((email) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    onHandled={handleHandled}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <PriorityGroup
              label="Alta priorità"
              emails={grouped.high}
              defaultOpen
              accentClass="text-destructive"
              onHandled={handleHandled}
            />
            <PriorityGroup
              label="Media priorità"
              emails={grouped.medium}
              defaultOpen
              accentClass="text-amber-600 dark:text-amber-400"
              onHandled={handleHandled}
            />
            <PriorityGroup
              label="Bassa priorità"
              emails={grouped.low}
              defaultOpen={false}
              accentClass="text-muted-foreground"
              onHandled={handleHandled}
            />
          </>
        )}
      </main>
    </div>
  )
}
