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
  gmail_message_id: string
  thread_id: string | null
  from_address: string | null
  from_name: string | null
  subject: string | null
  snippet: string | null
  body_plain: string | null
  received_at: string | null
  priority: 'high' | 'medium' | 'low' | 'spam' | null
  category: string | null
  urgency_hours: number | null
  intent: string | null
  ai_summary: string | null
  ai_suggested_reply: string | null
  is_processed: boolean
  is_handled: boolean
  created_at: string
}
