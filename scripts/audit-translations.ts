import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface AuditRow {
  id: string
  account_id: string
  subject: string | null
  subject_it: string | null
  subject_en: string | null
  subject_es: string | null
  body_plain: string | null
  body_it: string | null
  body_en: string | null
  body_es: string | null
  ai_summary: string | null
  ai_summary_it: string | null
  ai_summary_en: string | null
  ai_summary_es: string | null
  intent: string | null
  intent_it: string | null
  intent_en: string | null
  intent_es: string | null
}

async function main() {
  const { data, error } = await supabase
    .from('emails_mock')
    .select('id, account_id, subject, subject_it, subject_en, subject_es, body_plain, body_it, body_en, body_es, ai_summary, ai_summary_it, ai_summary_en, ai_summary_es, intent, intent_it, intent_en, intent_es')

  if (error) {
    console.error(error)
    process.exit(1)
  }

  const nativeOf: Record<string, 'it' | 'en' | 'es'> = {
    'account-001': 'it',
    'account-002': 'en',
    'account-003': 'es',
  }

  let needsTranslation = 0
  const issues: Array<{ id: string; field: string; locale: string }> = []
  const rows = (data ?? []) as AuditRow[]

  for (const row of rows) {
    const native = nativeOf[row.account_id]
    if (!native) continue
    for (const locale of ['it', 'en', 'es'] as const) {
      if (locale === native) continue
      for (const field of ['subject', 'body', 'ai_summary', 'intent']) {
        const baseKey = field === 'body' ? 'body_plain' : field
        const localizedKey = `${field === 'body' ? 'body' : field}_${locale}`
        const row2 = row as unknown as Record<string, string | null>
        const base = row2[baseKey]
        const localized = row2[localizedKey]
        if (!localized || localized === base) {
          needsTranslation++
          issues.push({ id: row.id, field: localizedKey, locale })
        }
      }
    }
  }

  console.log(`Total rows: ${rows.length}`)
  console.log(`Fields needing translation: ${needsTranslation}`)
  console.log(`Sample issues (first 10):`)
  for (const issue of issues.slice(0, 10)) {
    console.log(`  ${issue.id.slice(0, 8)} | ${issue.field}`)
  }
}

main()
