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
