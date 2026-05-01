import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockStream } = vi.hoisted(() => ({ mockStream: vi.fn() }))
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { stream: mockStream } }
  }),
}))

import { generateReply } from '@/lib/ai/suggest-reply'

async function* fakeStream(events: unknown[]) {
  for (const e of events) yield e
}

const baseEmail = {
  id: 'e1',
  from_name: 'Mario',
  from_address: 'mario@example.com',
  subject: 'Hello',
  body_plain: 'Can you help?',
  thread_id: null,
  snippet: null,
  priority: null,
  category: null,
  urgency_hours: null,
  intent: null,
  ai_summary: null,
  ai_suggested_reply: null,
  is_processed: false,
  is_handled: false,
  received_at: null,
  created_at: new Date().toISOString(),
  user_id: 'user@example.com',
  gmail_message_id: 'gm1',
}

describe('generateReply', () => {
  beforeEach(() => mockStream.mockReset())

  it('happy path — yields 3 text chunks', async () => {
    const events = [
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Ciao' } },
      { type: 'content_block_delta', delta: { type: 'text_delta', text: ', come' } },
      { type: 'content_block_delta', delta: { type: 'text_delta', text: ' stai?' } },
    ]
    mockStream.mockReturnValue(fakeStream(events))
    const chunks: string[] = []
    for await (const chunk of generateReply(baseEmail)) {
      chunks.push(chunk)
    }
    expect(chunks).toEqual(['Ciao', ', come', ' stai?'])
  })

  it('non-text events filtered — only text_delta yields', async () => {
    const events = [
      { type: 'message_start', message: {} },
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } },
      { type: 'message_stop' },
    ]
    mockStream.mockReturnValue(fakeStream(events))
    const chunks: string[] = []
    for await (const chunk of generateReply(baseEmail)) {
      chunks.push(chunk)
    }
    expect(chunks).toEqual(['Hello'])
  })

  it('stream error — propagates out of generator', async () => {
    async function* errorStream() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'start' } }
      throw new Error('Stream failed')
    }
    mockStream.mockReturnValue(errorStream())
    const gen = generateReply(baseEmail)
    await gen.next() // consume first chunk
    await expect(gen.next()).rejects.toThrow('Stream failed')
  })
})
