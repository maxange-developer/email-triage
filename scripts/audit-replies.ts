import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface ReplyByTone {
  professional: string
  friendly: string
  formal: string
}

interface ReplyMatrix {
  it?: ReplyByTone
  en?: ReplyByTone
  es?: ReplyByTone
}

interface Row {
  id: string
  priority: string | null
  ai_suggested_replies: ReplyMatrix | null
}

async function main() {
  const { data: rows, error } = await supabase
    .from('emails_mock')
    .select('id, priority, ai_suggested_replies')

  if (error) {
    console.error(error)
    process.exit(1)
  }

  let totalCombos = 0
  let needed = 0
  let alreadyDone = 0
  let skippedSpam = 0
  const missing: Array<{ id: string; locale: string; tone: string }> = []

  for (const row of (rows ?? []) as Row[]) {
    if (row.priority === 'spam') {
      skippedSpam++
      continue
    }
    const matrix = row.ai_suggested_replies
    if (!matrix) continue
    for (const locale of ['it', 'en', 'es'] as const) {
      for (const tone of ['friendly', 'formal'] as const) {
        totalCombos++
        const value = matrix[locale]?.[tone]
        if (value && value.trim() !== '') {
          alreadyDone++
        } else {
          needed++
          missing.push({ id: row.id, locale, tone })
        }
      }
    }
  }

  console.log(`Total non-spam rows: ${(rows?.length ?? 0) - skippedSpam}`)
  console.log(`Spam rows skipped: ${skippedSpam}`)
  console.log(`Total tone-locale combos: ${totalCombos}`)
  console.log(`Already populated: ${alreadyDone}`)
  console.log(`Need generation: ${needed}`)
  console.log(`\nFirst 5 missing combos:`)
  for (const m of missing.slice(0, 5)) {
    console.log(`  ${m.id.slice(0, 8)} | ${m.locale} | ${m.tone}`)
  }
}

main()
