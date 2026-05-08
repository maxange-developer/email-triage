'use client'

import { useState, useTransition } from 'react'
import { ArrowLeft, Copy, Send, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { type EmailRow } from '@/lib/validations/email'
import { formatRelative } from '@/lib/utils/time'
import { sendEmailAction } from '@/app/app/actions'
import { useI18n } from '@/i18n/client'
import { getLocalizedEmail } from '@/lib/utils/email-locale'
import { CustomSelect } from '@/components/ui/custom-select'

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
  medium: 'border-l-4 border-l-amber-500',
  low: 'border-l-4 border-l-white/20',
}

const PRIORITY_CHIP: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  low: 'bg-white/5 text-white/40 border border-white/10',
  spam: 'bg-white/5 text-white/40 border border-white/10',
}

export default function EmailDetail({ email: rawEmail }: { email: EmailRow }) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const email = getLocalizedEmail(rawEmail, locale)
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
      toast.error(t.email.generateError)
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
      if (result.success) toast.success(t.email.sent)
      else toast.error(result.error ?? t.email.sendFailed)
    })
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Back button — Angel1 style */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/60 text-sm uppercase tracking-wider px-3 py-1.5 border border-transparent hover:border-white/40 hover:text-white transition-all duration-200"
      >
        <ArrowLeft size={14} aria-hidden />
        {t.email.back}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: email content */}
        <article className={`glass p-5 border-2 border-white/10 ${priorityBorder}`}>
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
                <span className="text-[10px] px-2 py-0.5 border border-neon-green/20 text-neon-green/60 uppercase tracking-wider">
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
        <aside className="glass p-5 border-2 border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-neon-green uppercase tracking-wider">
            {t.email.aiReply}
          </h3>

          {/* Tone selector + generate button */}
          <div className="flex items-center gap-2">
            <CustomSelect
              value={tone}
              onChange={setTone}
              options={[
                { value: 'professional', label: t.email.professional },
                { value: 'friendly', label: t.email.friendly },
                { value: 'formal', label: t.email.formal },
              ]}
              className="flex-1"
            />
            <button
              onClick={handleGenerate}
              disabled={streaming}
              className="h-9 px-4 border-2 border-neon-green text-white text-xs font-semibold uppercase tracking-wider relative overflow-hidden hover:text-white transition-all duration-300 group disabled:opacity-50 shrink-0"
            >
              <span className="absolute inset-0 bg-neon-green scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-1.5">
                <RefreshCw size={11} className={streaming ? 'animate-spin' : ''} aria-hidden />
                {t.email.generate}
              </span>
            </button>
          </div>

          {/* Streaming textarea */}
          <div className="relative">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={8}
              placeholder={t.email.replyPlaceholder}
              className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-neon-green transition-colors duration-200 resize-none scrollbar-hide min-h-32"
            />
            {streaming && (
              <div className="absolute bottom-3 right-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"
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
                toast.success(t.email.copied)
              }}
              className="h-9 px-3 border border-neon-green/40 text-white/60 text-xs uppercase tracking-wider hover:bg-neon-green/10 hover:text-neon-green transition-all duration-200 disabled:opacity-30 flex items-center gap-1.5"
            >
              <Copy size={11} aria-hidden />
              {t.email.copy}
            </button>
            <button
              disabled={sending || !reply || streaming}
              onClick={handleSend}
              className="h-9 px-3 border-2 border-neon-pink text-white text-xs font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black transition-all duration-300 group disabled:opacity-30 flex items-center gap-1.5"
            >
              <span className="absolute inset-0 bg-neon-pink scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-1.5">
                <Send size={11} aria-hidden />
                {sending ? t.email.sending : t.email.send}
              </span>
            </button>
          </div>

          {email.ai_summary && (
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs text-white/30">
                <span className="font-medium text-white/50">{t.email.aiSummaryLabel}</span>{' '}
                {email.ai_summary}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
