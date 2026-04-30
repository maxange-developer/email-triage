import { createServiceClient } from '@/lib/supabase/service'
import type { ParsedEmail } from '@/lib/gmail/sync'
import type { Classification, EmailForClassification, EmailRow } from '@/lib/validations/email'

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

export async function getEmailsGrouped(
  userId: string,
): Promise<{ high: EmailRow[]; medium: EmailRow[]; low: EmailRow[] }> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('emails')
    .select('*')
    .eq('user_id', userId)
    .eq('is_handled', false)
    .eq('is_processed', true)
    .order('received_at', { ascending: false })
  if (error) throw new Error(`getEmailsGrouped: ${error.message}`)
  const rows = (data ?? []) as EmailRow[]
  return {
    high: rows.filter(e => e.priority === 'high'),
    medium: rows.filter(e => e.priority === 'medium'),
    low: rows.filter(e => e.priority === 'low'),
  }
}

export async function markHandled(emailId: string): Promise<void> {
  const db = createServiceClient()
  const { error } = await db
    .from('emails')
    .update({ is_handled: true })
    .eq('id', emailId)
  if (error) throw new Error(`markHandled: ${error.message}`)
}

export async function searchEmails(userId: string, query: string): Promise<EmailRow[]> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('emails')
    .select('*')
    .eq('user_id', userId)
    .eq('is_handled', false)
    .or(`from_address.ilike.%${query}%,from_name.ilike.%${query}%,subject.ilike.%${query}%`)
    .order('received_at', { ascending: false })
  if (error) throw new Error(`searchEmails: ${error.message}`)
  return (data ?? []) as EmailRow[]
}

export async function getEmailById(emailId: string): Promise<EmailRow | null> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('emails')
    .select('*')
    .eq('id', emailId)
    .single()
  if (error && error.code === 'PGRST116') return null
  if (error) throw new Error(`getEmailById: ${error.message}`)
  return data as EmailRow
}
