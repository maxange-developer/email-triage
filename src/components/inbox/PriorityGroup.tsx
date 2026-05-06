'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { type EmailRow } from '@/lib/validations/email'
import EmailCard from '@/components/inbox/EmailCard'

const ACCENT: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-white/40',
}

const BADGE: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  low: 'bg-white/5 text-white/40 border border-white/10',
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
        className="flex items-center gap-2 w-full text-left py-2 px-1 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/40 rounded"
        aria-expanded={open}
        type="button"
      >
        <span className={`text-sm font-semibold uppercase tracking-wider ${ACCENT[priority]}`}>
          {label}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${BADGE[priority]}`}>
          {emails.length}
        </span>
        <ChevronDown
          className={`ml-auto h-4 w-4 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="space-y-2 mt-1">
          {emails.length === 0 ? (
            <p className="text-sm text-white/30 py-4 text-center">No emails</p>
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
