import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface SampleRow {
  id: string
  account_id: string
  subject_it: string | null
  subject_en: string | null
  subject_es: string | null
  body_it: string | null
  body_en: string | null
  body_es: string | null
}

async function main() {
  // One row per account to span all 3 source languages
  const accounts = ['account-001', 'account-002', 'account-003']
  for (const account of accounts) {
    const { data } = await supabase
      .from('emails_mock')
      .select('id, account_id, subject_it, subject_en, subject_es, body_it, body_en, body_es')
      .eq('account_id', account)
      .limit(1)

    const rows = (data ?? []) as SampleRow[]
    for (const row of rows) {
      console.log(`\n━━━ ${row.id.slice(0, 8)} (${row.account_id}) ━━━`)
      console.log(`IT: ${row.subject_it}`)
      console.log(`    ${row.body_it?.slice(0, 100)}...`)
      console.log(`EN: ${row.subject_en}`)
      console.log(`    ${row.body_en?.slice(0, 100)}...`)
      console.log(`ES: ${row.subject_es}`)
      console.log(`    ${row.body_es?.slice(0, 100)}...`)
    }
  }
}

main()
