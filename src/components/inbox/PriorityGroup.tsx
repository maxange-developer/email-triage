'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { type EmailRow } from '@/lib/validations/email'
import EmailCard from '@/components/inbox/EmailCard'

interface PriorityGroupProps {
  label: string
  emails: EmailRow[]
  defaultOpen: boolean
  accentClass: string
  onHandled: (id: string) => void
}

export default function PriorityGroup({
  label,
  emails,
  defaultOpen,
  accentClass,
  onHandled,
}: PriorityGroupProps) {
  const [open, setOpen] = useState(defaultOpen)

  const headingId = `group-heading-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <section role="region" aria-labelledby={headingId}>
      <button
        id={headingId}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 w-full text-left py-2 px-1 font-semibold text-sm ${accentClass} hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded`}
        aria-expanded={open}
        type="button"
      >
        <span>
          {label} · {emails.length}
        </span>
        <ChevronDown
          className={`ml-auto h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="space-y-2 mt-1">
          {emails.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nessuna email
            </p>
          ) : (
            emails.map((email) => (
              <EmailCard key={email.id} email={email} onHandled={onHandled} />
            ))
          )}
        </div>
      )}
    </section>
  )
}
