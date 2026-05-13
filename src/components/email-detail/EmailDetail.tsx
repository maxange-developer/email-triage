'use client'

import { useState, useEffect, useTransition } from 'react'
import { ArrowLeft, Copy, Send, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { type EmailRow } from '@/lib/validations/email'
import { formatRelative } from '@/lib/utils/time'
import { sendEmailAction } from '@/app/app/actions'
import { useI18n } from '@/i18n/client'
import { getLocalizedEmail } from '@/lib/utils/email-locale'
import { buildReplySubject } from '@/lib/utils/reply-subject'
import { CustomSelect } from '@/components/ui/custom-select'

async function streamReply(
  emailId: string,
  tone: string,
  locale: string,
  onChunk: (t: string) => void,
): Promise<void> {
  const res = await fetch(`/api/emails/${emailId}/suggest-reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tone, locale }),
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
  high: 'border-l-[3px] border-l-[var(--priority-high)]',
  medium: 'border-l-[3px] border-l-[var(--priority-medium)]',
  low: 'border-l-[3px] border-l-[var(--ink-4)]',
}

const PRIORITY_CHIP: Record<string, string> = {
  high: 'bg-[var(--priority-high-bg)] border border-[var(--priority-high)]/40 text-[var(--priority-high)]',
  medium: 'bg-[var(--priority-medium-bg)] border border-[var(--priority-medium)]/40 text-[var(--priority-medium)]',
  low: 'bg-transparent border border-[var(--hairline)] text-[var(--ink-3)]',
  spam: 'bg-transparent border border-[var(--hairline)] text-[var(--ink-3)]',
}

export default function EmailDetail({ email: rawEmail }: { email: EmailRow }) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const email = getLocalizedEmail(rawEmail, locale)
  const [reply, setReply] = useState('')
  const [replySubject, setReplySubject] = useState<string>(() =>
    buildReplySubject(email.subject),
  )
  const [tone, setTone] = useState('professional')
  const [streaming, setStreaming] = useState(false)
  const [sending, setSending] = useState(false)
  const [, startTransition] = useTransition()

  const priorityBorder = email.priority ? (PRIORITY_BORDER[email.priority] ?? '') : ''

  // Map i18n locale ('gb') to email locale column ('en')
  const apiLocale = locale === 'gb' ? 'en' : locale

  // Rebuild subject when email or its localized subject changes
  useEffect(() => {
    setReplySubject(buildReplySubject(email.subject))
  }, [email.id, email.subject])

  // Clear stale generated reply when locale changes (was generated in previous language)
  useEffect(() => {
    setReply('')
  }, [locale])

  async function handleGenerate() {
    setReply('')
    setStreaming(true)
    try {
      await streamReply(email.id, tone, apiLocale, (chunk) => setReply((prev) => prev + chunk))
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
        subject: replySubject,
        body: reply,
        threadId: email.thread_id ?? undefined,
        inReplyTo: email.gmail_message_id ?? undefined,
      })
      setSending(false)
      if (result.success) toast.success(t.email.sent)
      else toast.error(result.error ?? t.email.sendFailed)
    })
  }

  const monoFont = { fontFamily: "var(--font-mono)" }
  const serifFont = { fontFamily: "var(--font-serif)" }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-up">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 h-8 px-3 rounded-[4px] border border-[var(--hairline)] text-[var(--ink-2)] text-[12px] hover:border-[var(--hairline-strong)] hover:bg-[var(--surface-2)] transition-colors duration-200"
      >
        <ArrowLeft size={13} strokeWidth={1.5} aria-hidden />
        {t.email.back}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: email content */}
        <article className={`card-editorial p-5 ${priorityBorder}`}>
          <header className="space-y-3 mb-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-medium text-[var(--ink-1)]">{email.from_name ?? email.from_address}</span>
              {email.from_name && (
                <span className="text-[var(--ink-3)]">&lt;{email.from_address}&gt;</span>
              )}
              <span className="text-[var(--ink-3)] ml-auto text-[11px] tabular-nums" style={monoFont}>
                {formatRelative(email.received_at)}
              </span>
            </div>

            <h2
              className="text-[24px] leading-[1.2] font-medium text-[var(--ink-1)]"
              style={serifFont}
            >
              {email.subject ?? '(no subject)'}
            </h2>

            {/* Badge row */}
            <div className="flex flex-wrap gap-2">
              {email.priority && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-[0.06em] ${PRIORITY_CHIP[email.priority] ?? ''}`}
                  style={monoFont}
                >
                  {email.priority}
                </span>
              )}
              {email.category && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--hairline)] text-[var(--ink-3)] uppercase tracking-[0.06em]"
                  style={monoFont}
                >
                  {email.category.replace(/_/g, ' ')}
                </span>
              )}
              {email.urgency_hours != null && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-line)] text-[var(--accent)] uppercase tracking-[0.06em]"
                  style={monoFont}
                >
                  {email.urgency_hours}h
                </span>
              )}
            </div>
          </header>

          <div className="border-t border-[var(--hairline)] pt-4">
            <div className="text-[14px] text-[var(--ink-2)] whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto scrollbar-hide">
              {email.body_plain ?? ''}
            </div>
          </div>
        </article>

        {/* RIGHT: reply generation */}
        <aside className="card-editorial p-5 space-y-4">
          <h3 className="text-[14px] font-medium text-[var(--ink-1)]">
            {t.email.aiReply}
          </h3>

          {/* Reply subject (editable) */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reply-subject"
              className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]"
              style={monoFont}
            >
              {t.email.subjectLabel}
            </label>
            <input
              id="reply-subject"
              type="text"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              placeholder={t.email.subjectPlaceholder}
              className="h-10 px-3 rounded-[4px] bg-[var(--surface)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] focus:border-[var(--accent)] focus:outline-none transition-colors duration-200 text-[var(--ink-1)] text-sm placeholder:text-[var(--ink-3)]"
            />
          </div>

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
              className="h-9 px-4 rounded-[4px] bg-[var(--accent)] text-white text-[12px] font-medium flex items-center gap-1.5 hover:bg-[var(--accent-2)] transition-colors duration-200 disabled:opacity-50 shrink-0"
            >
              <RefreshCw size={12} strokeWidth={1.5} className={streaming ? 'animate-spin' : ''} aria-hidden />
              {t.email.generate}
            </button>
          </div>

          {/* Streaming textarea */}
          <div className="relative">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={8}
              placeholder={t.email.replyPlaceholder}
              className="w-full bg-[var(--surface)] border border-[var(--hairline)] rounded-[4px] p-3 text-[var(--ink-1)] text-[14px] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200 resize-none scrollbar-hide min-h-32"
            />
            {streaming && (
              <div className="absolute bottom-3 right-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"
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
              className="h-9 px-3 rounded-[4px] border border-[var(--hairline)] text-[var(--ink-2)] text-[12px] hover:border-[var(--hairline-strong)] hover:bg-[var(--surface-2)] transition-colors duration-200 disabled:opacity-30 flex items-center gap-1.5"
            >
              <Copy size={12} strokeWidth={1.5} aria-hidden />
              {t.email.copy}
            </button>
            <button
              disabled={sending || !reply || streaming}
              onClick={handleSend}
              className="h-9 px-3 rounded-[4px] bg-[var(--accent)] text-white text-[12px] font-medium flex items-center gap-1.5 hover:bg-[var(--accent-2)] transition-colors duration-200 disabled:opacity-30"
            >
              <Send size={12} strokeWidth={1.5} aria-hidden />
              {sending ? t.email.sending : t.email.send}
            </button>
          </div>

          {email.ai_summary && (
            <div className="border-t border-[var(--hairline)] pt-3">
              <p className="text-[12px] text-[var(--ink-3)]">
                <span className="font-medium text-[var(--ink-2)]">{t.email.aiSummaryLabel}</span>{' '}
                {email.ai_summary}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
