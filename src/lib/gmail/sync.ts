import { getGmailClient } from './client'
import type { gmail_v1 } from 'googleapis'

export interface ParsedEmail {
  gmail_message_id: string
  thread_id: string | null
  from_address: string | null
  from_name: string | null
  subject: string | null
  snippet: string | null
  body_plain: string | null
  received_at: string | null
}

export async function fetchMessages(
  accessToken: string,
  maxResults = 100,
): Promise<gmail_v1.Schema$Message[]> {
  const gmail = getGmailClient(accessToken)
  const res = await gmail.users.messages.list({ userId: 'me', maxResults })
  return res.data.messages ?? []
}

export async function fetchMessageDetail(
  accessToken: string,
  messageId: string,
): Promise<gmail_v1.Schema$Message> {
  const gmail = getGmailClient(accessToken)
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  })
  return res.data
}

function decodeBase64url(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

function extractPlainBody(payload: gmail_v1.Schema$MessagePart | undefined): string | null {
  if (!payload) return null
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64url(payload.body.data)
  }
  for (const part of payload.parts ?? []) {
    const found = extractPlainBody(part)
    if (found) return found
  }
  return null
}

function parseFromHeader(from: string): { from_name: string | null; from_address: string | null } {
  const match = from.match(/^(.*?)\s*<(.+?)>$/)
  if (match) {
    return {
      from_name: match[1].replace(/^"|"$/g, '').trim() || null,
      from_address: match[2].trim(),
    }
  }
  return { from_name: null, from_address: from.trim() || null }
}

export function parseMessage(raw: gmail_v1.Schema$Message): ParsedEmail {
  const headers = raw.payload?.headers ?? []
  const get = (name: string) =>
    headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value ?? null

  const { from_name, from_address } = parseFromHeader(get('From') ?? '')
  const receivedAt = raw.internalDate
    ? new Date(parseInt(raw.internalDate)).toISOString()
    : null

  return {
    gmail_message_id: raw.id!,
    thread_id: raw.threadId ?? null,
    from_name,
    from_address,
    subject: get('Subject'),
    snippet: raw.snippet ?? null,
    body_plain: extractPlainBody(raw.payload),
    received_at: receivedAt,
  }
}

export async function fetchHistoryDelta(
  accessToken: string,
  historyId: string,
): Promise<gmail_v1.Schema$Message[]> {
  const gmail = getGmailClient(accessToken)
  const res = await gmail.users.history.list({
    userId: 'me',
    startHistoryId: historyId,
    historyTypes: ['messageAdded'],
  })
  const history = res.data.history ?? []
  return history.flatMap(h => h.messagesAdded?.map(m => m.message ?? {}) ?? [])
}
