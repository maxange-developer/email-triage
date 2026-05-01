import { describe, it, expect } from 'vitest'
import { parseMessage } from '@/lib/gmail/sync'

function b64url(text: string): string {
  return Buffer.from(text).toString('base64url')
}

describe('parseMessage', () => {
  it('simple text/plain email — extracts body_plain', () => {
    const raw = {
      id: 'msg1',
      threadId: 'thread1',
      snippet: 'Hello',
      internalDate: '1700000000000',
      payload: {
        mimeType: 'text/plain',
        headers: [
          { name: 'From', value: 'Test <test@example.com>' },
          { name: 'Subject', value: 'Hello' },
        ],
        body: { data: b64url('Hello world') },
      },
    }
    const result = parseMessage(raw)
    expect(result.body_plain).toBe('Hello world')
    expect(result.gmail_message_id).toBe('msg1')
  })

  it('multipart/mixed email — extracts text/plain part', () => {
    const raw = {
      id: 'msg2',
      threadId: 'thread2',
      snippet: 'Hi',
      internalDate: '1700000000000',
      payload: {
        mimeType: 'multipart/mixed',
        headers: [{ name: 'From', value: 'Test <test@example.com>' }],
        body: {},
        parts: [
          { mimeType: 'text/plain', body: { data: b64url('Plain text content') }, parts: [] },
          { mimeType: 'text/html', body: { data: b64url('<p>HTML content</p>') }, parts: [] },
        ],
      },
    }
    const result = parseMessage(raw)
    expect(result.body_plain).toBe('Plain text content')
  })

  it('From header parsing — extracts name and address', () => {
    const raw = {
      id: 'msg3',
      threadId: null,
      snippet: null,
      internalDate: '1700000000000',
      payload: {
        mimeType: 'text/plain',
        headers: [{ name: 'From', value: 'John Doe <john@example.com>' }],
        body: { data: b64url('body') },
      },
    }
    const result = parseMessage(raw)
    expect(result.from_name).toBe('John Doe')
    expect(result.from_address).toBe('john@example.com')
  })

  it('internalDate — converts to valid ISO string', () => {
    const raw = {
      id: 'msg4',
      threadId: null,
      snippet: null,
      internalDate: '1700000000000',
      payload: {
        mimeType: 'text/plain',
        headers: [{ name: 'From', value: 'test@example.com' }],
        body: { data: b64url('body') },
      },
    }
    const result = parseMessage(raw)
    expect(result.received_at).toBeTruthy()
    expect(() => new Date(result.received_at!).toISOString()).not.toThrow()
    expect(new Date(result.received_at!).getTime()).toBe(1700000000000)
  })
})
