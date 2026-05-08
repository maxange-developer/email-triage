import { createServiceClient } from '@/lib/supabase/service'
import {
  ClassificationRulesMapSchema,
  type ClassificationRulesMap,
} from '@/lib/validations/settings'

export async function getUserSettings(userId: string): Promise<{
  email_address: string | null
  classification_rules: ClassificationRulesMap
}> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('users_settings')
    .select('email_address, classification_rules')
    .eq('user_id', userId)
    .single()
  if (error && error.code === 'PGRST116') {
    return { email_address: null, classification_rules: {} }
  }
  if (error) throw new Error(`getUserSettings: ${error.message}`)
  const parsed = ClassificationRulesMapSchema.safeParse(data?.classification_rules ?? {})
  return {
    email_address: data?.email_address ?? null,
    classification_rules: parsed.success ? parsed.data : {},
  }
}

export async function saveClassificationRules(
  userId: string,
  rules: ClassificationRulesMap,
): Promise<void> {
  const db = createServiceClient()
  const { error } = await db
    .from('users_settings')
    .upsert({ user_id: userId, classification_rules: rules })
  if (error) throw new Error(`saveClassificationRules: ${error.message}`)
}
