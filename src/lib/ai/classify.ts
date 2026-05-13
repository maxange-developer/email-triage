import OpenAI from 'openai'
import { ClassificationSchema } from '@/lib/validations/email'
import type { Classification, EmailForClassification } from '@/lib/validations/email'
import { logger } from '@/lib/logger'

let _client: OpenAI | null = null
function getClient() {
  if (!_client) _client = new OpenAI()
  return _client
}

const SYSTEM_PROMPT =
  'Classify the email. Return JSON with keys: priority (high|medium|low|spam), ' +
  'category (client_request|sales_lead|internal|newsletter|notification|support|invoice|other), ' +
  'urgency_hours (number), intent (1 line: what the sender wants), summary (1 line: for inbox view). ' +
  'No extra keys, no markdown.'

export async function classifyEmail(email: EmailForClassification): Promise<Classification> {
  const userMessage = [
    `From: ${email.from_name ?? ''} <${email.from_address ?? ''}>`,
    `Subject: ${email.subject ?? ''}`,
    `Body:`,
    (email.body_plain ?? '').slice(0, 1500),
  ].join('\n')

  const completion = await getClient().chat.completions.create({
    // COST GUARD: hardcoded to gpt-4o-mini.
    // Do NOT change to gpt-4o or higher without explicit approval.
    // See OpenAI cost incident 2026-05-12.
    model: 'gpt-4o-mini-2024-07-18',
    max_tokens: 150,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  })

  const raw = completion.choices[0].message.content
  if (!raw) throw new Error(`classifyEmail: empty response for email ${email.id}`)

  const usage = completion.usage
  if (usage) {
    const cost_usd = (usage.prompt_tokens * 0.00015 + usage.completion_tokens * 0.0006) / 1000
    logger.info('classify.cost', {
      email: email.id,
      tokens_in: usage.prompt_tokens,
      tokens_out: usage.completion_tokens,
      cost_usd,
    })
  }

  return ClassificationSchema.parse(JSON.parse(raw))
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
