'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { markHandledAction } from '@/app/app/actions'
import { type EmailRow } from '@/lib/validations/email'
import { formatRelative } from '@/lib/utils/time'

interface EmailCardProps {
  email: EmailRow
  onHandled: (id: string) => void
}

function prettifyCategory(category: string | null): string {
  if (!category) return ''
  return category
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

function PriorityBadge({ priority }: { priority: EmailRow['priority'] }) {
  if (!priority) return null
  if (priority === 'high') {
    return <Badge variant="destructive">Alta</Badge>
  }
  if (priority === 'medium') {
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0">
        Media
      </Badge>
    )
  }
  if (priority === 'low') {
    return <Badge variant="outline">Bassa</Badge>
  }
  // spam
  return <Badge variant="secondary">Spam</Badge>
}

export default function EmailCard({ email, onHandled }: EmailCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const senderLabel = email.from_name ?? email.from_address ?? 'Sconosciuto'

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
      className="w-full cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      role="button"
      tabIndex={0}
      aria-label={`Email da ${senderLabel}: ${email.subject ?? 'nessun oggetto'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      <CardContent className="p-3 space-y-1.5">
        {/* Top row: badges + time */}
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={email.priority} />
          {email.category && (
            <Badge variant="outline" className="text-xs">
              {prettifyCategory(email.category)}
            </Badge>
          )}
          <span className="ml-auto text-xs text-muted-foreground shrink-0">
            {formatRelative(email.received_at)}
          </span>
        </div>

        {/* Sender */}
        <p className="font-medium text-sm truncate">{senderLabel}</p>

        {/* Subject */}
        <p className="text-sm text-foreground truncate">
          {email.subject ?? '(nessun oggetto)'}
        </p>

        {/* Summary */}
        <p className="text-sm text-muted-foreground line-clamp-1">
          {email.ai_summary ?? 'Classificazione in corso...'}
        </p>

        {/* Bottom row: action button */}
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHandled}
            disabled={isPending}
            aria-label="Segna come gestita"
          >
            {isPending ? 'Salvataggio...' : 'Gestita'}
          </Button>
        </div>
      </CardContent>
    </article>
  )
}
