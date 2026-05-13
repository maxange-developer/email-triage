import type { EmailRow, ToneKey } from '@/lib/validations/email'
import type { Locale } from '@/i18n/client'

// Maps i18n locale ('gb'|'it'|'es') to email column suffix ('en'|'it'|'es')
const LOCALE_TO_COL: Record<Locale, 'en' | 'it' | 'es'> = {
  gb: 'en',
  it: 'it',
  es: 'es',
}

/**
 * Returns the localized version of an email for the given UI locale.
 * Falls back from JSONB matrix → TEXT field → default field as schema migrates.
 */
export function getLocalizedEmail(
  email: EmailRow,
  locale: Locale,
  tone: ToneKey = 'professional',
): EmailRow {
  const col = LOCALE_TO_COL[locale]
  const row = email as unknown as Record<string, unknown>

  // Resolve reply: prefer JSONB matrix → fall back to TEXT field → fall back to default
  let resolvedReply: string | null | undefined = undefined
  const matrix = row['ai_suggested_replies'] as
    | Partial<Record<'it' | 'en' | 'es', Partial<Record<ToneKey, string>>>>
    | null
    | undefined
  if (matrix && typeof matrix === 'object') {
    resolvedReply = matrix[col]?.[tone]
  }
  if (!resolvedReply) {
    resolvedReply =
      (row[`ai_suggested_reply_${col}`] as string | null | undefined) ??
      email.ai_suggested_reply
  }

  return {
    ...email,
    subject: (row[`subject_${col}`] as string | null | undefined) ?? email.subject,
    body_plain: (row[`body_${col}`] as string | null | undefined) ?? email.body_plain,
    ai_summary: (row[`ai_summary_${col}`] as string | null | undefined) ?? email.ai_summary,
    ai_suggested_reply: resolvedReply ?? email.ai_suggested_reply,
    intent: (row[`intent_${col}`] as string | null | undefined) ?? email.intent,
  }
}
