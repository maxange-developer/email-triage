import OpenAI from 'openai'
import type { EmailRow } from '@/lib/validations/email'

let _client: OpenAI | null = null
function getClient() {
  if (!_client) _client = new OpenAI()
  return _client
}

const TONE_MAP: Record<string, string> = {
  professional: 'professionale e diretto',
  friendly: 'amichevole e cordiale',
  formal: 'formale e istituzionale',
}

export async function* generateReply(
  email: EmailRow,
  tone = 'professional',
): AsyncGenerator<string> {
  if (process.env.USE_MOCK_AI === 'true') {
    const reply = email.ai_suggested_reply ?? 'Grazie per il messaggio. La contatterò a breve. Cordiali saluti, Massimiliano'
    for (const word of reply.split(' ')) {
      yield word + ' '
      await new Promise(r => setTimeout(r, 50))
    }
    return
  }

  const toneLabel = TONE_MAP[tone] ?? 'professionale e diretto'
  let promptTokens = 0
  let completionTokens = 0

  const stream = await getClient().chat.completions.create({
    // COST GUARD: hardcoded to gpt-4o-mini.
    // Do NOT change to gpt-4o or higher without explicit approval.
    // See OpenAI cost incident 2026-05-12.
    model: 'gpt-4o-mini-2024-07-18',
    max_tokens: 300,
    stream: true,
    stream_options: { include_usage: true },
    messages: [
      {
        role: 'system',
        content: `Scrivi risposte email concise (3-5 frasi). Tono: ${toneLabel}. Firma sempre "Massimiliano". Scrivi solo il testo della risposta, niente altro.`,
      },
      {
        role: 'user',
        content: [
          `Da: ${email.from_name ?? ''} <${email.from_address ?? ''}>`,
          `Oggetto: ${email.subject ?? '(nessun oggetto)'}`,
          '',
          (email.body_plain ?? '').slice(0, 1000),
        ].join('\n'),
      },
    ],
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
    if (chunk.usage) {
      promptTokens = chunk.usage.prompt_tokens
      completionTokens = chunk.usage.completion_tokens
    }
  }

  if (promptTokens > 0) {
    console.info(
      `[suggest-reply] email=${email.id} in=${promptTokens} out=${completionTokens} ` +
      `cost~$${((promptTokens * 0.00015 + completionTokens * 0.0006) / 1000).toFixed(6)}`,
    )
  }
}
