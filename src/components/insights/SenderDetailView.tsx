'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { SenderEmail, SenderStats } from '@/lib/db/analytics'
import { useI18n } from '@/i18n/client'

const MONO_FONT = "var(--font-mono)"
const SERIF_FONT = "var(--font-serif)"

const PRIORITY_BORDER: Record<string, string> = {
  high: 'border-l-[var(--priority-high)]',
  medium: 'border-l-[var(--priority-medium)]',
  low: 'border-l-[var(--ink-4)]',
  spam: 'border-l-[var(--ink-4)]',
}

const PRIORITY_BADGE: Record<string, string> = {
  high: 'bg-[var(--priority-high-bg)] border border-[var(--priority-high)]/40 text-[var(--priority-high)]',
  medium: 'bg-[var(--priority-medium-bg)] border border-[var(--priority-medium)]/40 text-[var(--priority-medium)]',
  low: 'bg-transparent border border-[var(--hairline)] text-[var(--ink-3)]',
  spam: 'bg-transparent border border-[var(--hairline)] text-[var(--ink-3)]',
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-editorial p-6">
      <p className="eyebrow mb-2">{label}</p>
      <p
        className="text-[28px] leading-none font-medium text-[var(--ink-1)]"
        style={{ letterSpacing: '-0.02em' }}
      >
        {value}
      </p>
    </div>
  )
}

interface SenderDetailViewProps {
  fromAddress: string
  fromName: string | null
  stats: SenderStats
  emails: SenderEmail[]
}

export default function SenderDetailView({
  fromAddress,
  fromName,
  stats,
  emails,
}: SenderDetailViewProps) {
  const router = useRouter()
  const { t } = useI18n()

  const initials = (fromName ?? fromAddress)
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  const highPct = stats.total ? Math.round((stats.highCount / stats.total) * 100) : 0

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-up">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 h-8 px-3 rounded-[4px] border border-[var(--hairline)] text-[var(--ink-2)] text-[12px] hover:border-[var(--hairline-strong)] hover:bg-[var(--surface-2)] transition-colors duration-200"
      >
        <ArrowLeft size={13} strokeWidth={1.5} />
        {t.insights.topSenders}
      </button>

      {/* Sender header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 flex-shrink-0 rounded-[4px] border border-[var(--accent-line)] bg-[var(--accent-soft)] flex items-center justify-center">
          <span className="text-xl font-medium text-[var(--accent)]">{initials || '?'}</span>
        </div>
        <div className="min-w-0">
          {fromName && (
            <p className="text-[18px] font-medium text-[var(--ink-1)] leading-tight truncate">{fromName}</p>
          )}
          <p className="text-sm text-[var(--ink-3)] truncate">{fromAddress}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t.insights.totalEmails} value={stats.total} />
        <StatCard label={t.insights.highPriority} value={`${highPct}%`} />
        <StatCard label={t.insights.topCategory} value={stats.topCategory?.replace(/_/g, ' ') ?? '—'} />
        <StatCard label={t.insights.avgUrgency} value={`${stats.avgUrgencyHours}h`} />
      </div>

      {/* Email list */}
      <div className="card-editorial">
        <div className="px-5 py-4 border-b border-[var(--hairline)]">
          <h3 className="eyebrow">{t.insights.emailList}</h3>
        </div>
        {emails.length === 0 ? (
          <p className="text-sm text-[var(--ink-3)] p-5">{t.insights.noData}</p>
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {emails.map((email) => {
              const priority = email.priority ?? 'low'
              return (
                <li
                  key={email.id}
                  className={`px-5 py-4 border-l-[3px] ${PRIORITY_BORDER[priority] ?? 'border-l-[var(--ink-4)]'} hover:bg-[var(--surface-2)] transition-colors duration-200`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[15px] text-[var(--ink-1)] truncate"
                        style={{ fontFamily: SERIF_FONT }}
                      >
                        {email.subject ?? '(no subject)'}
                      </p>
                      {email.ai_summary && (
                        <p className="text-[13px] text-[var(--ink-2)] mt-1 line-clamp-2 leading-[1.5]">
                          {email.ai_summary}
                        </p>
                      )}
                      {email.received_at && (
                        <p
                          className="text-[11px] text-[var(--ink-3)] mt-1 tabular-nums"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          {new Date(email.received_at).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {priority && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-[0.06em] ${PRIORITY_BADGE[priority] ?? ''}`}
                          style={{ fontFamily: MONO_FONT }}
                        >
                          {priority}
                        </span>
                      )}
                      {email.category && (
                        <span
                          className="text-[10px] text-[var(--ink-3)] uppercase tracking-[0.06em]"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          {email.category.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
