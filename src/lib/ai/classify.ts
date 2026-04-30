import Anthropic from '@anthropic-ai/sdk'
import { ClassificationSchema } from '@/lib/validations/email'
import type { Classification, EmailForClassification } from '@/lib/validations/email'

const client = new Anthropic()

const CLASSIFY_TOOL: Anthropic.Tool = {
  name: 'classify_email',
  description: 'Classify an email by priority, category, urgency, intent, and summary.',
  input_schema: {
    type: 'object' as const,
    properties: {
      priority: {
        type: 'string',
        enum: ['high', 'medium', 'low', 'spam'],
      },
      category: {
        type: 'string',
        enum: [
          'client_request', 'sales_lead', 'internal',
          'newsletter', 'notification', 'support', 'invoice', 'other',
        ],
      },
      urgency_hours: { type: 'number' },
      intent: { type: 'string', description: '1 riga: cosa vuole il mittente' },
      summary: { type: 'string', description: '1 riga: riassunto per inbox view' },
    },
    required: ['priority', 'category', 'urgency_hours', 'intent', 'summary'],
  },
}

export async function classifyEmail(email: EmailForClassification): Promise<Classification> {
  const prompt = [
    `From: ${email.from_name ?? ''} <${email.from_address ?? ''}>`,
    `Subject: ${email.subject ?? ''}`,
    `Body:`,
    (email.body_plain ?? '').slice(0, 2000),
  ].join('\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    tools: [CLASSIFY_TOOL],
    tool_choice: { type: 'tool', name: 'classify_email' },
    messages: [{ role: 'user', content: prompt }],
  })

  // Find the tool_use block in the response
  const block = response.content.find(b => b.type === 'tool_use')
  if (!block || block.type !== 'tool_use') {
    throw new Error(`classifyEmail: no tool_use block in response for email ${email.id}`)
  }

  // Validate the tool input with Zod — throws ZodError if invalid
  return ClassificationSchema.parse(block.input)
}

export async function classifyBatch(
  emails: EmailForClassification[],
  concurrency = 5,
): Promise<Map<string, Classification>> {
  const results = new Map<string, Classification>()

  for (let i = 0; i < emails.length; i += concurrency) {
    const chunk = emails.slice(i, i + concurrency)
    const settled = await Promise.allSettled(
      chunk.map(email => classifyEmail(email).then(c => ({ id: email.id, classification: c }))),
    )
    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        results.set(outcome.value.id, outcome.value.classification)
      }
      // Silently skip failures — email stays is_processed=false for retry
    }
  }

  return results
}
