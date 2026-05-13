'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { markHandledAction } from '@/app/app/actions'
import { type EmailRow } from '@/lib/validations/email'
import { formatRelative } from '@/lib/utils/time'
import { cn } from '@/lib/utils'

interface EmailCardProps {
  email: EmailRow
  onHandled: (id: string) => void
  priority?: 'high' | 'medium' | 'low'
}

const PRIORITY_BORDER: Record<string, string> = {
  high: 'border-l-[3px] border-l-[var(--priority-high)]',
  medium: 'border-l-[3px] border-l-[var(--priority-medium)]',
  low: 'border-l-[3px] border-l-[var(--ink-4)]',
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
      className={cn(
        'group w-full cursor-pointer card-editorial overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40',
        borderClass,
      )}
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
      <div className="p-4 space-y-2">
        {/* Top row: sender + time */}
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-[14px] text-[var(--ink-1)] truncate">
            {senderLabel}
          </p>
          <span
            className="text-[11px] text-[var(--ink-3)] shrink-0 tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatRelative(email.received_at)}
          </span>
        </div>

        {/* Subject — SERIF, the editorial touch */}
        <p
          className="text-[16px] leading-[1.3] text-[var(--ink-1)] truncate"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {email.subject ?? '(no subject)'}
        </p>

        {/* AI Summary */}
        <p className="text-[13px] text-[var(--ink-2)] leading-[1.5] line-clamp-2">
          {email.ai_summary ?? 'Classification in progress…'}
        </p>

        {/* Bottom row */}
        <div className="flex items-center gap-3 pt-1">
          {email.category && (
            <span
              className="text-[10px] text-[var(--ink-3)] uppercase tracking-[0.06em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {prettifyCategory(email.category)}
            </span>
          )}
          <button
            onClick={handleHandled}
            disabled={isPending}
            aria-label="Mark as handled"
            className="ml-auto flex items-center gap-1.5 text-[12px] text-[var(--ink-3)] hover:text-[var(--accent)] transition-colors duration-200 disabled:opacity-50"
          >
            <CheckCheck size={12} strokeWidth={1.5} aria-hidden />
            {isPending ? '…' : 'Done'}
          </button>
        </div>
      </div>
    </article>
  )
}
