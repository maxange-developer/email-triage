import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { EmailRow } from '@/lib/validations/email'

const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }))

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function () {
    return { chat: { completions: { create: mockCreate } } }
  }),
}))

import { generateReply } from '@/lib/ai/suggest-reply'

const baseEmail: EmailRow = {
  id: 'email-1',
  user_id: 'user@example.com',
  account_id: 'acc-1',
  gmail_message_id: 'gm-1',
  thread_id: null,
  from_address: 'marco@example.com',
  from_name: 'Marco',
  subject: 'Bug',
  snippet: null,
  body_plain: 'There is a bug in checkout',
  received_at: null,
  priority: null,
  category: null,
  urgency_hours: null,
  intent: null,
  ai_summary: null,
  ai_suggested_reply: null,
  is_processed: false,
  is_handled: false,
  created_at: new Date().toISOString(),
}

interface StreamChunk {
  choices: Array<{ delta: { content?: string } }>
  usage?: { prompt_tokens: number; completion_tokens: number }
}

function makeStream(chunks: string[], usage = { prompt_tokens: 120, completion_tokens: 60 }) {
  return {
    async *[Symbol.asyncIterator](): AsyncGenerator<StreamChunk> {
      for (const chunk of chunks) {
        yield { choices: [{ delta: { content: chunk } }] }
      }
      yield { choices: [{ delta: {} }], usage }
    },
  }
}

function makeErrorStream(beforeError: string[]) {
  return {
    async *[Symbol.asyncIterator](): AsyncGenerator<StreamChunk> {
      for (const chunk of beforeError) {
        yield { choices: [{ delta: { content: chunk } }] }
      }
      throw new Error('Stream failed')
    },
  }
}

async function collect(gen: AsyncGenerator<string>): Promise<string[]> {
  const out: string[] = []
  for await (const chunk of gen) out.push(chunk)
  return out
}

describe('generateReply', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    // Ensure real-OpenAI path is exercised, not the USE_MOCK_AI shortcut
    delete process.env.USE_MOCK_AI
  })

  it('streams text deltas from the OpenAI response and accumulates them', async () => {
    mockCreate.mockResolvedValue(makeStream(['Ciao', ' Marco,', ' ricevuto.']))

    const chunks = await collect(generateReply(baseEmail))
    expect(chunks).toEqual(['Ciao', ' Marco,', ' ricevuto.'])
    expect(chunks.join('')).toBe('Ciao Marco, ricevuto.')
    expect(mockCreate).toHaveBeenCalledOnce()
  })

  it('skips chunks with empty/undefined delta.content', async () => {
    const stream = {
      async *[Symbol.asyncIterator](): AsyncGenerator<StreamChunk> {
        yield { choices: [{ delta: { content: 'Hello' } }] }
        yield { choices: [{ delta: {} }] } // no content
        yield { choices: [{ delta: { content: ' there' } }] }
        yield { choices: [{ delta: {} }], usage: { prompt_tokens: 50, completion_tokens: 10 } }
      },
    }
    mockCreate.mockResolvedValue(stream)

    const chunks = await collect(generateReply(baseEmail))
    expect(chunks).toEqual(['Hello', ' there'])
  })

  it('uses the cost-pinned gpt-4o-mini model with streaming enabled', async () => {
    mockCreate.mockResolvedValue(makeStream(['ok']))
    await collect(generateReply(baseEmail))

    const args = mockCreate.mock.calls[0][0]
    expect(args.model).toBe('gpt-4o-mini-2024-07-18')
    expect(args.stream).toBe(true)
    expect(args.stream_options).toEqual({ include_usage: true })
  })

  it('passes tone through to the system prompt (friendly → amichevole)', async () => {
    mockCreate.mockResolvedValue(makeStream(['ok']))
    await collect(generateReply(baseEmail, 'friendly'))

    const systemMessage: string = mockCreate.mock.calls[0][0].messages[0].content
    expect(systemMessage.toLowerCase()).toContain('amichevole')
  })

  it('falls back to "professional" tone when given an unknown tone key', async () => {
    mockCreate.mockResolvedValue(makeStream(['ok']))
    await collect(generateReply(baseEmail, 'banana'))

    const systemMessage: string = mockCreate.mock.calls[0][0].messages[0].content
    expect(systemMessage.toLowerCase()).toContain('professionale')
  })

  it('truncates body to 1000 chars before sending to OpenAI', async () => {
    mockCreate.mockResolvedValue(makeStream(['ok']))
    const longBody = 'x'.repeat(2000)
    await collect(generateReply({ ...baseEmail, body_plain: longBody }))

    const userMessage: string = mockCreate.mock.calls[0][0].messages[1].content
    const bodySection = userMessage.split('\n\n')[1] ?? ''
    expect(bodySection.length).toBeLessThanOrEqual(1000)
  })

  it('propagates stream errors out of the generator', async () => {
    mockCreate.mockResolvedValue(makeErrorStream(['start']))

    const gen = generateReply(baseEmail)
    const first = await gen.next()
    expect(first.value).toBe('start')
    await expect(gen.next()).rejects.toThrow('Stream failed')
  })

  it('USE_MOCK_AI=true short-circuits OpenAI and yields the stored reply', async () => {
    process.env.USE_MOCK_AI = 'true'
    const email: EmailRow = { ...baseEmail, ai_suggested_reply: 'Hi Marco. Looking now.' }

    const chunks = await collect(generateReply(email))
    expect(chunks.join('')).toContain('Hi Marco')
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
