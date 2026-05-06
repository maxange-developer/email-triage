'use client'

import { useState, useTransition } from 'react'
import { ArrowLeft, Copy, Send, RefreshCw } from 'lucide-react'
import Link from 'next/link'
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

const PRIORITY_BORDER: Record<string, string> = {
  high: 'border-l-4 border-l-red-500',
  medium: 'border-l-4 border-l-yellow-500',
  low: 'border-l-4 border-l-white/20',
}

const PRIORITY_CHIP: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  low: 'bg-white/5 text-white/40 border border-white/10',
  spam: 'bg-white/5 text-white/40 border border-white/10',
}

export default function EmailDetail({ email }: { email: EmailRow }) {
  const [reply, setReply] = useState('')
  const [tone, setTone] = useState('professional')
  const [streaming, setStreaming] = useState(false)
  const [sending, setSending] = useState(false)
  const [, startTransition] = useTransition()

  const priorityBorder = email.priority ? (PRIORITY_BORDER[email.priority] ?? '') : ''

  async function handleGenerate() {
    setReply('')
    setStreaming(true)
    try {
      await streamReply(email.id, tone, (chunk) => setReply((prev) => prev + chunk))
    } catch {
      toast.error('Error generating reply')
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
      if (result.success) toast.success('Email sent')
      else toast.error(result.error ?? 'Send failed')
    })
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Back link */}
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-neon-blue transition-colors duration-200"
      >
        <ArrowLeft size={14} aria-hidden />
        Inbox
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: email content */}
        <article className={`glass rounded-lg p-5 border-2 border-white/10 ${priorityBorder}`}>
          <header className="space-y-3 mb-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-bold text-white">{email.from_name ?? email.from_address}</span>
              {email.from_name && (
                <span className="text-white/40">&lt;{email.from_address}&gt;</span>
              )}
              <span className="text-white/30 ml-auto text-xs">{formatRelative(email.received_at)}</span>
            </div>

            <h2 className="text-lg font-bold text-white">{email.subject ?? '(no subject)'}</h2>

            {/* Badge row */}
            <div className="flex flex-wrap gap-2">
              {email.priority && (
                <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider ${PRIORITY_CHIP[email.priority] ?? ''}`}>
                  {email.priority}
                </span>
              )}
              {email.category && (
                <span className="text-[10px] px-2 py-0.5 border border-white/10 text-white/40 uppercase tracking-wider">
                  {email.category.replace(/_/g, ' ')}
                </span>
              )}
              {email.urgency_hours != null && (
                <span className="text-[10px] px-2 py-0.5 border border-neon-blue/20 text-neon-blue/60 uppercase tracking-wider">
                  {email.urgency_hours}h
                </span>
              )}
            </div>
          </header>

          <div className="border-t border-white/10 pt-4">
            <div className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto scrollbar-hide">
              {email.body_plain ?? ''}
            </div>
          </div>
        </article>

        {/* RIGHT: reply generation */}
        <aside className="glass rounded-lg p-5 border-2 border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider">
            AI Reply
          </h3>

          {/* Tone selector + generate button */}
          <div className="flex items-center gap-2">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="flex-1 h-10 bg-white/5 border border-white/20 px-3 text-white text-sm focus:outline-none focus:border-neon-blue transition-colors duration-200 appearance-none"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={streaming}
              className="h-10 px-4 border-2 border-neon-pink text-white text-xs font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black transition-all duration-300 group disabled:opacity-50 shrink-0"
            >
              <span className="absolute inset-0 bg-neon-pink scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-1.5">
                <RefreshCw size={11} className={streaming ? 'animate-spin' : ''} aria-hidden />
                Generate
              </span>
            </button>
          </div>

          {/* Streaming textarea */}
          <div className="relative">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={8}
              placeholder="Generated reply will appear here..."
              className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-neon-blue transition-colors duration-200 resize-none scrollbar-hide min-h-32"
            />
            {streaming && (
              <div className="absolute bottom-3 right-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <button
              disabled={!reply}
              onClick={() => {
                navigator.clipboard.writeText(reply)
                toast.success('Copied!')
              }}
              className="h-9 px-3 border border-neon-blue/40 text-white/60 text-xs uppercase tracking-wider hover:bg-neon-blue/10 hover:text-neon-blue transition-all duration-200 disabled:opacity-30 flex items-center gap-1.5"
            >
              <Copy size={11} aria-hidden />
              Copy
            </button>
            <button
              disabled={sending || !reply || streaming}
              onClick={handleSend}
              className="h-9 px-3 border-2 border-neon-green text-white text-xs font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black transition-all duration-300 group disabled:opacity-30 flex items-center gap-1.5"
            >
              <span className="absolute inset-0 bg-neon-green scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-1.5">
                <Send size={11} aria-hidden />
                {sending ? 'Sending...' : 'Send via Gmail'}
              </span>
            </button>
          </div>

          {email.ai_summary && (
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs text-white/30">
                <span className="font-medium text-white/50">AI Summary:</span>{' '}
                {email.ai_summary}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
