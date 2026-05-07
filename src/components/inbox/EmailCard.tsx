'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { markHandledAction } from '@/app/app/actions'
import { type EmailRow } from '@/lib/validations/email'
import { formatRelative } from '@/lib/utils/time'

interface EmailCardProps {
  email: EmailRow
  onHandled: (id: string) => void
  priority?: 'high' | 'medium' | 'low'
}

const PRIORITY_BORDER: Record<string, string> = {
  high: 'border-l-4 border-l-red-500',
  medium: 'border-l-4 border-l-yellow-500',
  low: 'border-l-4 border-l-white/20',
}

function prettifyCategory(category: string | null): string {
  if (!category) return ''
  return category.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

export default function EmailCard({ email, onHandled, priority }: EmailCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const senderLabel = email.from_name ?? email.from_address ?? 'Unknown'
  const borderClass = priority ? (PRIORITY_BORDER[priority] ?? '') : ''

  function handleCardClick() {
    router.push(`/app/email/${email.id}`)
  }

  function handleHandled(e: React.MouseEvent) {
    e.stopPropagation()
    startTransition(async () => {
      await markHandledAction(email.id)
      onHandled(email.id)
    })
  }

  return (
    <article
      onClick={handleCardClick}
      className={`w-full cursor-pointer glass hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-gold/40 ${borderClass}`}
      role="button"
      tabIndex={0}
      aria-label={`Email from ${senderLabel}: ${email.subject ?? 'no subject'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="p-3 space-y-1.5">
        {/* Top row: sender + time */}
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-sm text-white truncate">{senderLabel}</p>
          <span className="text-xs text-white/30 shrink-0">{formatRelative(email.received_at)}</span>
        </div>

        {/* Subject */}
        <p className="text-sm text-white/80 truncate">
          {email.subject ?? '(no subject)'}
        </p>

        {/* AI Summary */}
        <p className="text-xs text-white/40 truncate">
          {email.ai_summary ?? 'Classification in progress...'}
        </p>

        {/* Bottom row: category chip + handled button */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {email.category && (
            <span className="text-[10px] px-2 py-0.5 border border-white/10 text-white/40 uppercase tracking-wider">
              {prettifyCategory(email.category)}
            </span>
          )}
          <button
            onClick={handleHandled}
            disabled={isPending}
            aria-label="Mark as handled"
            className="ml-auto text-xs text-white/30 hover:text-neon-green transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
          >
            <CheckCheck size={12} aria-hidden />
            {isPending ? '...' : 'Done'}
          </button>
        </div>
      </div>
    </article>
  )
}
