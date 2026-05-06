import { createServiceClient } from '@/lib/supabase/service'
import type { GmailAccount } from '@/lib/types'

function mapRow(row: Record<string, unknown>): GmailAccount {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    emailAddress: row.email_address as string,
    displayName: row.display_name as string | null,
    isPrimary: row.is_primary as boolean,
    createdAt: row.created_at as string,
  }
}

export async function getAccountsByUser(userId: string): Promise<GmailAccount[]> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('gmail_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
  if (error) throw new Error(`getAccountsByUser: ${error.message}`)
  return (data ?? []).map(r => mapRow(r as Record<string, unknown>))
}

export async function getActiveAccountId(userId: string): Promise<string | null> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('users_settings')
    .select('active_account_id')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw new Error(`getActiveAccountId: ${error.message}`)
  return (data as { active_account_id: string | null } | null)?.active_account_id ?? null
}

export async function addAccount(
  userId: string,
  emailAddress: string,
  displayName?: string,
): Promise<{ data: GmailAccount | null; error: Error | null }> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('gmail_accounts')
    .upsert({
      user_id: userId,
      email_address: emailAddress,
      display_name: displayName ?? null,
      is_primary: false,
    })
    .select()
    .single()
  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRow(data as Record<string, unknown>), error: null }
}

export async function setActiveAccount(userId: string, accountId: string): Promise<{ error: Error | null }> {
  const db = createServiceClient()
  const { error } = await db
    .from('users_settings')
    .update({ active_account_id: accountId })
    .eq('user_id', userId)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}

export async function deleteAccount(userId: string, accountId: string): Promise<{ error: Error | null }> {
  const db = createServiceClient()
  // Never delete primary account
  const { error } = await db
    .from('gmail_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', userId)
    .eq('is_primary', false)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}
