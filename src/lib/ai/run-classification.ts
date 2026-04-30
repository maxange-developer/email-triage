import { getBatchUnclassified, updateClassification } from '@/lib/db/emails'
import { classifyBatch } from '@/lib/ai/classify'

export interface ClassificationResult {
  classified: number
  cost_cents: number
}

export async function runClassification(userId: string): Promise<ClassificationResult> {
  const emails = await getBatchUnclassified(userId, 50)
  if (emails.length === 0) return { classified: 0, cost_cents: 0 }

  const results = await classifyBatch(emails)

  for (const [emailId, c] of results) {
    await updateClassification(emailId, c)
  }

  // Haiku: ~$0.00048/email (300 input + 60 output tokens at current pricing)
  const cost_cents = Math.round(results.size * 0.048 * 100) / 100

  return { classified: results.size, cost_cents }
}
