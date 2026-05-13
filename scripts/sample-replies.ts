import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface ReplyMatrix {
  it?: { professional?: string; friendly?: string; formal?: string }
  en?: { professional?: string; friendly?: string; formal?: string }
  es?: { professional?: string; friendly?: string; formal?: string }
}

interface SampleRow {
  id: string
  account_id: string
  subject_it: string | null
  subject_en: string | null
  subject_es: string | null
  ai_suggested_replies: ReplyMatrix | null
  priority: string | null
}

async function main() {
  const accounts = ['account-001', 'account-002', 'account-003']
  for (const accountId of accounts) {
    const { data } = await supabase
      .from('emails_mock')
      .select('id, account_id, subject_it, subject_en, subject_es, ai_suggested_replies, priority')
      .eq('account_id', accountId)
      .not('priority', 'eq', 'spam')
      .limit(1)
      .single()

    if (!data) continue
    const row = data as SampleRow
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`${row.account_id} — ${row.subject_it ?? row.subject_en ?? row.subject_es}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    const replies = row.ai_suggested_replies
    for (const locale of ['it', 'en', 'es'] as const) {
      console.log(`\n  ▸ ${locale.toUpperCase()}`)
      for (const tone of ['professional', 'friendly', 'formal'] as const) {
        const text = replies?.[locale]?.[tone] ?? '(empty)'
        const preview = text.length > 180 ? text.slice(0, 180) + '...' : text
        console.log(`    [${tone}] ${preview}`)
      }
    }
  }
}

main()
