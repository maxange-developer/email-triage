import Anthropic from '@anthropic-ai/sdk'
import type { EmailRow } from '@/lib/validations/email'

const client = new Anthropic()

const TONE_MAP: Record<string, string> = {
  professional: 'professionale e diretto',
  friendly: 'amichevole e cordiale',
  formal: 'formale e istituzionale',
}

export async function* generateReply(
  email: EmailRow,
  tone = 'professional',
): AsyncGenerator<string> {
  const toneLabel = TONE_MAP[tone] ?? 'professionale e diretto'
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `Scrivi risposte email concise (3-5 frasi). Tono: ${toneLabel}. Firma sempre "Massimiliano". Scrivi solo il testo della risposta, niente altro.`,
    messages: [{
      role: 'user',
      content: [
        `Da: ${email.from_name ?? ''} <${email.from_address ?? ''}>`,
        `Oggetto: ${email.subject ?? '(nessun oggetto)'}`,
        '',
        (email.body_plain ?? '').slice(0, 3000),
      ].join('\n'),
    }],
  })
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}
