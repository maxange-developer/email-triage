import { createServiceClient } from '@/lib/supabase/service'
import type { ParsedEmail } from '@/lib/gmail/sync'
import type { Classification, EmailForClassification } from '@/lib/validations/email'

export async function upsertEmails(userId: string, emails: ParsedEmail[]): Promise<void> {
  if (emails.length === 0) return
  const db = createServiceClient()
  const rows = emails.map(e => ({ ...e, user_id: userId }))
  const { error } = await db
    .from('emails')
    .upsert(rows, { onConflict: 'gmail_message_id', ignoreDuplicates: true })
  if (error) throw new Error(`upsertEmails: ${error.message}`)
}

export async function getUnprocessedEmails(userId: string, limit = 50) {
  const db = createServiceClient()
  const { data, error } = await db
    .from('emails')
    .select('*')
    .eq('user_id', userId)
    .eq('is_processed', false)
    .limit(limit)
  if (error) throw new Error(`getUnprocessedEmails: ${error.message}`)
  return data ?? []
}

export async function markProcessed(emailId: string): Promise<void> {
  const db = createServiceClient()
  const { error } = await db
    .from('emails')
    .update({ is_processed: true })
    .eq('id', emailId)
  if (error) throw new Error(`markProcessed: ${error.message}`)
}

export async function getEmailsByPriority(userId: string) {
  const db = createServiceClient()
  const { data, error } = await db
    .from('emails')
    .select('*')
    .eq('user_id', userId)
    .order('priority')
    .order('received_at', { ascending: false })
  if (error) throw new Error(`getEmailsByPriority: ${error.message}`)
  return data ?? []
}

export async function saveHistoryId(userId: string, historyId: string): Promise<void> {
  const db = createServiceClient()
  const { error } = await db
    .from('users_settings')
    .upsert({ user_id: userId, history_id: historyId })
  if (error) throw new Error(`saveHistoryId: ${error.message}`)
}

export async function getHistoryId(userId: string): Promise<string | null> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('users_settings')
    .select('history_id')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw new Error(`getHistoryId: ${error.message}`)
  return data?.history_id ?? null
}

export async function getBatchUnclassified(
  userId: string,
  limit = 50,
): Promise<EmailForClassification[]> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('emails')
    .select('id, from_address, from_name, subject, body_plain')
    .eq('user_id', userId)
    .eq('is_processed', false)
    .limit(limit)
  if (error) throw new Error(`getBatchUnclassified: ${error.message}`)
  return (data ?? []) as EmailForClassification[]
}

export async function updateClassification(
  emailId: string,
  c: Classification,
): Promise<void> {
  const db = createServiceClient()
  const { error } = await db
    .from('emails')
    .update({
      priority: c.priority,
      category: c.category,
      urgency_hours: c.urgency_hours,
      intent: c.intent,
      ai_summary: c.summary,
      is_processed: true,
    })
    .eq('id', emailId)
  if (error) throw new Error(`updateClassification: ${error.message}`)
}
