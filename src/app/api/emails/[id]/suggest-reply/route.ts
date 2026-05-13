import { NextRequest, NextResponse } from 'next/server'
import { getAppSession } from '@/lib/auth/get-session'
import { getEmailById } from '@/lib/db/emails'
import { generateReply } from '@/lib/ai/suggest-reply'
import type { EmailRow, ToneKey, ReplyMatrix } from '@/lib/validations/email'

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true'

const TONE_VALUES = ['professional', 'friendly', 'formal'] as const
const LOCALE_VALUES = ['it', 'en', 'es'] as const

function parseTone(value: unknown): ToneKey {
  return TONE_VALUES.includes(value as ToneKey) ? (value as ToneKey) : 'professional'
}

function parseLocale(value: unknown): 'it' | 'en' | 'es' {
  return LOCALE_VALUES.includes(value as 'it' | 'en' | 'es')
    ? (value as 'it' | 'en' | 'es')
    : 'en'
}

/**
 * Simulate streaming: split text into small chunks and emit with delays
 * to mimic the OpenAI streaming UX (the "3 animated dots" effect).
 * ~1.5s perceived latency on a 500-char reply.
 */
function streamText(text: string): Response {
  const encoder = new TextEncoder()
  const CHUNK_SIZE = 12
  const DELAY_MS = 35

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (let i = 0; i < text.length; i += CHUNK_SIZE) {
          const chunk = text.slice(i, i + CHUNK_SIZE)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
          )
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
        }
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

function streamFromGenerator(email: EmailRow, tone: ToneKey): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generateReply(email, tone)) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
          )
        }
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAppSession()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = (await req.json()) as { tone?: unknown; locale?: unknown }
  const tone = parseTone(body.tone)
  const locale = parseLocale(body.locale)

  const email = await getEmailById(id)
  if (!email) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // MOCK PATH: stream pre-cached JSONB reply
  if (USE_MOCK_AI) {
    const matrix = email.ai_suggested_replies as ReplyMatrix | null | undefined
    const cached = matrix?.[locale]?.[tone]
    const fallback =
      matrix?.[locale]?.professional ??
      matrix?.en?.[tone] ??
      matrix?.en?.professional ??
      email.ai_suggested_reply ??
      ''
    const text = cached && cached.trim() !== '' ? cached : fallback
    return streamText(text)
  }

  // REAL AI PATH: stream from OpenAI generator
  return streamFromGenerator(email, tone)
}
