'use server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  fetchMessages,
  fetchMessageDetail,
  parseMessage,
  fetchHistoryDelta,
} from '@/lib/gmail/sync'
import {
  upsertEmails,
  saveHistoryId,
  getHistoryId,
  markHandled,
} from '@/lib/db/emails'
import { runClassification } from '@/lib/ai/run-classification'
import { sendEmail, type SendEmailParams } from '@/lib/gmail/send'

async function batchedMap<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size)
    results.push(...(await Promise.all(batch.map(fn))))
  }
  return results
}

export async function initialSync(): Promise<{ success: boolean; count: number; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken || !session.user?.email) {
    return { success: false, count: 0, error: 'Unauthorized' }
  }
  const { accessToken } = session
  const userId = session.user.email

  try {
    const stubs = await fetchMessages(accessToken, 100)
    if (stubs.length === 0) return { success: true, count: 0 }

    const details = await batchedMap(stubs, 10, stub =>
      fetchMessageDetail(accessToken, stub.id!),
    )
    const parsed = details.map(parseMessage)
    await upsertEmails(userId, parsed)

    const latestHistoryId = details[0].historyId
    if (latestHistoryId) await saveHistoryId(userId, latestHistoryId)

    if (parsed.length > 0) {
      await runClassification(userId)
    }
    return { success: true, count: parsed.length }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, count: 0, error: message }
  }
}

export async function incrementalSync(): Promise<{
  success: boolean
  count: number
  error?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken || !session.user?.email) {
    return { success: false, count: 0, error: 'Unauthorized' }
  }
  const { accessToken } = session
  const userId = session.user.email

  try {
    const historyId = await getHistoryId(userId)
    if (!historyId) return initialSync()

    const stubs = await fetchHistoryDelta(accessToken, historyId)
    if (stubs.length === 0) return { success: true, count: 0 }

    const details = await batchedMap(
      stubs.filter(s => s.id),
      10,
      stub => fetchMessageDetail(accessToken, stub.id!),
    )
    const parsed = details.map(parseMessage)
    await upsertEmails(userId, parsed)

    const latestHistoryId = details[0]?.historyId
    if (latestHistoryId) await saveHistoryId(userId, latestHistoryId)

    if (parsed.length > 0) {
      await runClassification(userId)
    }
    return { success: true, count: parsed.length }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, count: 0, error: message }
  }
}

export async function markHandledAction(
  emailId: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return { success: false, error: 'Unauthorized' }
  try {
    await markHandled(emailId)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function sendEmailAction(
  params: SendEmailParams,
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) return { success: false, error: 'Unauthorized' }
  try {
    await sendEmail(session.accessToken, params)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
