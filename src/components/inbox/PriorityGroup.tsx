'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { type EmailRow } from '@/lib/validations/email'
import EmailCard from '@/components/inbox/EmailCard'

const ACCENT: Record<string, string> = {
  high: 'text-[var(--priority-high)]',
  medium: 'text-[var(--priority-medium)]',
  low: 'text-[var(--ink-3)]',
}

const BADGE: Record<string, string> = {
  high: 'bg-[var(--priority-high-bg)] border border-[var(--priority-high)]/40 text-[var(--priority-high)]',
  medium: 'bg-[var(--priority-medium-bg)] border border-[var(--priority-medium)]/40 text-[var(--priority-medium)]',
  low: 'bg-transparent border border-[var(--hairline)] text-[var(--ink-3)]',
}

interface PriorityGroupProps {
  label: string
  emails: EmailRow[]
  defaultOpen: boolean
  priority: 'high' | 'medium' | 'low'
  onHandled: (id: string) => void
}

export default function PriorityGroup({
  label,
  emails,
  defaultOpen,
  priority,
  onHandled,
}: PriorityGroupProps) {
  const [open, setOpen] = useState(defaultOpen)
  const headingId = `group-heading-${priority}`

  return (
    <section role="region" aria-labelledby={headingId}>
      <button
        id={headingId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 w-full text-left py-2 px-1 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 rounded-[4px]"
        aria-expanded={open}
        type="button"
      >
        <span
          className={`text-[11px] font-medium uppercase tracking-[0.08em] ${ACCENT[priority]}`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full ${BADGE[priority]}`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {emails.length}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`ml-auto text-[var(--ink-3)] transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="space-y-2 mt-1">
          {emails.length === 0 ? (
            <p className="text-sm text-[var(--ink-4)] py-4 text-center">No emails</p>
          ) : (
            emails.map((email) => (
              <EmailCard key={email.id} email={email} onHandled={onHandled} priority={priority} />
            ))
          )}
        </div>
      )}
    </section>
  )
}
