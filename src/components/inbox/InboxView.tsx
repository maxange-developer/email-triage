'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { getBrowserClient } from '@/lib/supabase/client'
import { initialSync } from '@/app/app/actions'
import { type EmailRow } from '@/lib/validations/email'
import PriorityGroup from '@/components/inbox/PriorityGroup'
import EmailCard from '@/components/inbox/EmailCard'
import { useI18n } from '@/i18n/client'
import { getLocalizedEmail } from '@/lib/utils/email-locale'

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
  const { t, locale } = useI18n()

  // Sync state when server re-renders with new account's emails after router.refresh()
  useEffect(() => {
    setGrouped(initialEmails)
  }, [initialEmails])

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
      const result = await initialSync()
      if (result.success) toast.success(t.inbox.syncComplete)
      else toast.error(result.error ?? t.inbox.syncError)
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
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-[32px] font-medium text-[var(--ink-1)]"
            style={{ letterSpacing: '-0.03em' }}
          >
            {t.inbox.title}<span className="text-[var(--accent)]">.</span>
          </h1>
          {live && (
            <span className="flex items-center gap-1.5 text-[var(--accent)] text-xs mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              {t.inbox.live}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={13} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" aria-hidden />
            <input
              placeholder={t.inbox.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 h-9 bg-[var(--surface)] border border-[var(--hairline)] rounded-[4px] pl-8 pr-3 text-[var(--ink-1)] text-[14px] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200"
              aria-label={t.inbox.search}
            />
          </div>

          {/* Sync button */}
          <button
            onClick={handleSync}
            disabled={syncing}
            aria-label={syncing ? 'Syncing...' : 'Sync emails'}
            className="h-9 px-4 rounded-[4px] bg-[var(--accent)] text-white text-[12px] font-medium flex items-center gap-1.5 hover:bg-[var(--accent-2)] transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw size={13} strokeWidth={1.5} className={syncing ? 'animate-spin' : ''} aria-hidden />
            {syncing ? t.inbox.syncing : t.inbox.sync}
          </button>
        </div>
      </div>

      {/* Email list */}
      {search.trim() ? (
        <section aria-label="Search results">
          {filteredEmails.length === 0 ? (
            <p className="text-sm text-[var(--ink-3)] py-8 text-center">
              {t.inbox.noResults} &ldquo;{search}&rdquo;
            </p>
          ) : (
            <div className="space-y-2">
              {filteredEmails.map((email) => (
                <EmailCard key={email.id} email={getLocalizedEmail(email, locale)} onHandled={handleHandled} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-4">
          <PriorityGroup
            label={t.inbox.highPriority}
            emails={grouped.high.map((e) => getLocalizedEmail(e, locale))}
            defaultOpen
            priority="high"
            onHandled={handleHandled}
          />
          <PriorityGroup
            label={t.inbox.mediumPriority}
            emails={grouped.medium.map((e) => getLocalizedEmail(e, locale))}
            defaultOpen
            priority="medium"
            onHandled={handleHandled}
          />
          <PriorityGroup
            label={t.inbox.lowPriority}
            emails={grouped.low.map((e) => getLocalizedEmail(e, locale))}
            defaultOpen={false}
            priority="low"
            onHandled={handleHandled}
          />
        </div>
      )}
    </div>
  )
}
