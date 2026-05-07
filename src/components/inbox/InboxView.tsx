'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/client'
import { initialSync } from '@/app/app/actions'
import { type EmailRow } from '@/lib/validations/email'
import PriorityGroup from '@/components/inbox/PriorityGroup'
import EmailCard from '@/components/inbox/EmailCard'
import { useI18n } from '@/i18n/client'

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
  const [live, setLive] = useState(false)
  const [syncing, startSyncTransition] = useTransition()
  const { t } = useI18n()

  useEffect(() => {
    const channel = getBrowserClient()
      .channel('emails-inbox')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emails', filter: `user_id=eq.${userId}` },
        (payload) => {
          setLive(true)
          const row = payload.new as EmailRow
          if (!row || row.is_handled) {
            setGrouped((prev) => ({
              high: prev.high.filter((e) => e.id !== row?.id),
              medium: prev.medium.filter((e) => e.id !== row?.id),
              low: prev.low.filter((e) => e.id !== row?.id),
            }))
            return
          }
          setGrouped((prev) => {
            const without: GroupedEmails = {
              high: prev.high.filter((e) => e.id !== row.id),
              medium: prev.medium.filter((e) => e.id !== row.id),
              low: prev.low.filter((e) => e.id !== row.id),
            }
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
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-neon-gold" style={{ fontSize: 'var(--fs-page)' }}>
            {t.inbox.title}<span className="text-neon-gold">.</span>
          </h1>
          {live && (
            <span className="flex items-center gap-1.5 text-neon-green text-xs mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              {t.inbox.live}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" aria-hidden />
            <input
              placeholder={t.inbox.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 h-9 bg-white/5 border border-white/20 pl-8 pr-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-neon-gold transition-colors duration-200"
              aria-label={t.inbox.search}
            />
          </div>

          {/* Sync button */}
          <button
            onClick={handleSync}
            disabled={syncing}
            aria-label={syncing ? 'Syncing...' : 'Sync emails'}
            className="h-9 px-4 border-2 border-neon-gold text-white text-xs font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black transition-all duration-300 group disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-neon-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            <span className="relative z-10 flex items-center gap-1.5">
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} aria-hidden />
              {syncing ? t.inbox.syncing : t.inbox.sync}
            </span>
          </button>
        </div>
      </div>

      {/* Email list */}
      {search.trim() ? (
        <section aria-label="Search results">
          {filteredEmails.length === 0 ? (
            <p className="text-sm text-white/40 py-8 text-center">
              No results for &ldquo;{search}&rdquo;
            </p>
          ) : (
            <div className="space-y-2">
              {filteredEmails.map((email) => (
                <EmailCard key={email.id} email={email} onHandled={handleHandled} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-4">
          <PriorityGroup
            label={t.inbox.highPriority}
            emails={grouped.high}
            defaultOpen
            priority="high"
            onHandled={handleHandled}
          />
          <PriorityGroup
            label={t.inbox.mediumPriority}
            emails={grouped.medium}
            defaultOpen
            priority="medium"
            onHandled={handleHandled}
          />
          <PriorityGroup
            label={t.inbox.lowPriority}
            emails={grouped.low}
            defaultOpen={false}
            priority="low"
            onHandled={handleHandled}
          />
        </div>
      )}
    </div>
  )
}
