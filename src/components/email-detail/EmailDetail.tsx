'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { type EmailRow } from '@/lib/validations/email'
import { formatRelative } from '@/lib/utils/time'
import { sendEmailAction } from '@/app/app/actions'

async function streamReply(
  emailId: string,
  tone: string,
  onChunk: (t: string) => void,
): Promise<void> {
  const res = await fetch(`/api/emails/${emailId}/suggest-reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tone }),
  })
  if (!res.ok || !res.body) throw new Error('Stream failed')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const raw = decoder.decode(value, { stream: true })
    for (const line of raw.split('\n')) {
      if (!line.startsWith('data: ') || line.includes('[DONE]')) continue
      try {
        const { text } = JSON.parse(line.slice(6)) as { text: string }
        onChunk(text)
      } catch { /* ignore malformed */ }
    }
  }
}

export default function EmailDetail({ email }: { email: EmailRow }) {
  const [reply, setReply] = useState('')
  const [tone, setTone] = useState('professional')
  const [streaming, setStreaming] = useState(false)
  const [sending, setSending] = useState(false)
  const [, startTransition] = useTransition()

  async function handleGenerate() {
    setReply('')
    setStreaming(true)
    try {
      await streamReply(email.id, tone, chunk => setReply(prev => prev + chunk))
    } catch {
      toast.error('Errore nella generazione')
    } finally {
      setStreaming(false)
    }
  }

  function handleSend() {
    startTransition(async () => {
      setSending(true)
      const result = await sendEmailAction({
        to: email.from_address ?? '',
        subject: email.subject ?? '',
        body: reply,
        threadId: email.thread_id ?? undefined,
      })
      setSending(false)
      if (result.success) toast.success('Email inviata con successo')
      else toast.error(result.error ?? 'Errore invio')
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back link */}
      <div className="px-4 pt-4">
        <a
          href="/app"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          ← Inbox
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 max-w-5xl mx-auto">
        {/* LEFT: email content */}
        <article>
          <header className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-semibold">{email.from_name ?? email.from_address}</span>
              {email.from_name && (
                <span className="text-muted-foreground">&lt;{email.from_address}&gt;</span>
              )}
              <span className="text-muted-foreground ml-auto">
                {formatRelative(email.received_at)}
              </span>
            </div>
            <h2 className="text-xl font-bold">{email.subject ?? '(nessun oggetto)'}</h2>
            <div className="flex flex-wrap gap-2">
              {email.priority && (
                <Badge variant={email.priority === 'high' ? 'destructive' : 'outline'}>
                  {email.priority}
                </Badge>
              )}
              {email.category && (
                <Badge variant="secondary">{email.category.replace(/_/g, ' ')}</Badge>
              )}
              {email.intent && (
                <Badge variant="outline" className="max-w-[200px] truncate">
                  {email.intent}
                </Badge>
              )}
            </div>
          </header>
          <Separator className="my-4" />
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {email.body_plain ?? ''}
          </div>
        </article>

        {/* RIGHT: reply generation */}
        <aside className="space-y-3">
          <h3 className="font-semibold text-base">Risposta suggerita</h3>

          <div className="flex gap-2">
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="professional">Professionale</option>
              <option value="friendly">Amichevole</option>
              <option value="formal">Formale</option>
            </select>
            <Button onClick={handleGenerate} disabled={streaming}>
              {streaming ? 'Generazione...' : 'Genera risposta'}
            </Button>
          </div>

          <Textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={10}
            placeholder="La risposta generata apparirà qui..."
            className="resize-none"
          />

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={!reply}
              onClick={() => {
                navigator.clipboard.writeText(reply)
                toast.success('Copiato!')
              }}
            >
              Copia
            </Button>
            <Button
              size="sm"
              disabled={sending || !reply || streaming}
              onClick={handleSend}
            >
              {sending ? 'Invio...' : 'Invia via Gmail'}
            </Button>
          </div>

          {email.ai_summary && (
            <p className="text-xs text-muted-foreground border-t pt-2">
              <span className="font-medium">Sommario AI:</span> {email.ai_summary}
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
