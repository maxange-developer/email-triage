'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { SenderEmail, SenderStats } from '@/lib/db/analytics'
import { useI18n } from '@/i18n/client'

const PRIORITY_BORDER: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-white/20',
  spam: 'border-l-white/10',
}

const PRIORITY_BADGE: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border border-red-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  low: 'bg-white/5 text-white/40 border border-white/10',
  spam: 'bg-white/5 text-white/30 border border-white/10',
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass p-5 border-2 border-white/10 hover:border-neon-green/50 transition-colors duration-300 hover-lift">
      <p className="text-xs uppercase tracking-widest text-white/40 mb-2">{label}</p>
      <p className="text-3xl font-bold text-neon-green">{value}</p>
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
    <div className="space-y-6 animate-fade-up">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 h-9 px-4 text-xs font-semibold uppercase tracking-wider border border-white/20 text-white/60 hover:border-neon-green hover:text-white transition-all duration-200"
      >
        <ArrowLeft size={13} />
        {t.insights.topSenders}
      </button>

      {/* Sender header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 flex-shrink-0 border-2 border-neon-green/60 bg-neon-green/10 flex items-center justify-center">
          <span className="text-xl font-bold text-neon-green">{initials || '?'}</span>
        </div>
        <div className="min-w-0">
          {fromName && (
            <p className="text-lg font-bold text-white leading-tight truncate">{fromName}</p>
          )}
          <p className="text-sm text-white/50 truncate">{fromAddress}</p>
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
      <div className="glass border-2 border-white/10">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            {t.insights.emailList}
          </h3>
        </div>
        {emails.length === 0 ? (
          <p className="text-sm text-white/30 p-5">{t.insights.noData}</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {emails.map((email) => {
              const priority = email.priority ?? 'low'
              return (
                <li
                  key={email.id}
                  className={`px-5 py-4 border-l-2 ${PRIORITY_BORDER[priority] ?? 'border-l-white/10'} hover:bg-white/5 transition-colors`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {email.subject ?? '(no subject)'}
                      </p>
                      {email.ai_summary && (
                        <p className="text-xs text-white/40 mt-1 line-clamp-2">
                          {email.ai_summary}
                        </p>
                      )}
                      {email.received_at && (
                        <p className="text-xs text-white/25 mt-1">
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
                        <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider ${PRIORITY_BADGE[priority] ?? ''}`}>
                          {priority}
                        </span>
                      )}
                      {email.category && (
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">
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
