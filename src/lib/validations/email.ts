import { z } from 'zod'

export const ClassificationSchema = z.object({
  priority: z.enum(['high', 'medium', 'low', 'spam']),
  category: z.enum([
    'client_request', 'sales_lead', 'internal',
    'newsletter', 'notification', 'support', 'invoice', 'other',
  ]),
  urgency_hours: z.number(),
  intent: z.string(),
  summary: z.string(),
})
export type Classification = z.infer<typeof ClassificationSchema>

export const TONE_KEYS = ['professional', 'friendly', 'formal'] as const
export type ToneKey = typeof TONE_KEYS[number]

export const LOCALE_KEYS = ['it', 'en', 'es'] as const
export type LocaleKey = typeof LOCALE_KEYS[number]

export interface ReplyByTone {
  professional: string
  friendly: string
  formal: string
}

export interface ReplyMatrix {
  it: ReplyByTone
  en: ReplyByTone
  es: ReplyByTone
}

export interface EmailForClassification {
  id: string
  from_address: string | null
  from_name: string | null
  subject: string | null
  body_plain: string | null
}

export interface EmailRow {
  id: string
  user_id: string
  account_id: string | null
  gmail_message_id: string
  thread_id: string | null
  from_address: string | null
  from_name: string | null
  subject: string | null
  subject_it?: string | null
  subject_en?: string | null
  subject_es?: string | null
  snippet: string | null
  body_plain: string | null
  body_it?: string | null
  body_en?: string | null
  body_es?: string | null
  received_at: string | null
  priority: 'high' | 'medium' | 'low' | 'spam' | null
  category: string | null
  urgency_hours: number | null
  intent: string | null
  intent_it?: string | null
  intent_en?: string | null
  intent_es?: string | null
  ai_summary: string | null
  ai_summary_it?: string | null
  ai_summary_en?: string | null
  ai_summary_es?: string | null
  ai_suggested_reply: string | null
  ai_suggested_reply_it?: string | null
  ai_suggested_reply_en?: string | null
  ai_suggested_reply_es?: string | null
  ai_suggested_replies?: ReplyMatrix | null
  is_processed: boolean
  is_handled: boolean
  created_at: string
}
