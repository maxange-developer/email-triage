import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// COST GUARD: pinned model to keep costs predictable.
// Estimated total: ~120 calls * $0.0008 = ~$0.10
const MODEL = 'gpt-4o-mini-2024-07-18'

const NATIVE_OF: Record<string, 'it' | 'en' | 'es'> = {
  'account-001': 'it',
  'account-002': 'en',
  'account-003': 'es',
}

const LOCALE_NAMES = {
  it: 'Italian',
  en: 'English (UK)',
  es: 'Spanish (Spain)',
}

interface EmailRow {
  id: string
  account_id: string
  subject: string | null
  body_plain: string | null
  ai_summary: string | null
  intent: string | null
  subject_it: string | null
  subject_en: string | null
  subject_es: string | null
  body_it: string | null
  body_en: string | null
  body_es: string | null
  ai_summary_it: string | null
  ai_summary_en: string | null
  ai_summary_es: string | null
  intent_it: string | null
  intent_en: string | null
  intent_es: string | null
}

interface TranslationPayload {
  subject: string
  body: string
  ai_summary: string
  intent: string
}

async function translate(
  source: TranslationPayload,
  sourceLocale: 'it' | 'en' | 'es',
  targetLocale: 'it' | 'en' | 'es',
): Promise<TranslationPayload> {
  const sourceName = LOCALE_NAMES[sourceLocale]
  const targetName = LOCALE_NAMES[targetLocale]

  const prompt = `Translate the following business email content from ${sourceName} to ${targetName}.

Requirements:
- Preserve professional business tone
- Keep proper nouns, company names, and email addresses unchanged
- Keep currency symbols and amounts unchanged (e.g. €500, $1,000)
- Translate idiomatically — natural target language, not word-for-word
- Maintain the same formality level as the source

Input fields:
- subject: ${source.subject}
- body: ${source.body}
- ai_summary: ${source.ai_summary}
- intent: ${source.intent}

Respond ONLY with valid JSON in this exact format:
{
  "subject": "translated subject here",
  "body": "translated body here",
  "ai_summary": "translated summary here",
  "intent": "translated intent here"
}

No explanations, no markdown code blocks, just the JSON object.`

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: 'You are a professional translator specializing in business communication. Output only valid JSON.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error('OpenAI returned empty response')

  const parsed = JSON.parse(raw) as TranslationPayload
  if (!parsed.subject || !parsed.body || !parsed.ai_summary || !parsed.intent) {
    throw new Error(`Incomplete translation: ${raw.slice(0, 200)}`)
  }
  return parsed
}

async function main() {
  console.log(`Fetching emails from emails_mock...`)
  const { data: rows, error } = await supabase
    .from('emails_mock')
    .select('*')

  if (error || !rows) {
    console.error('Failed to fetch:', error)
    process.exit(1)
  }

  console.log(`Found ${rows.length} email rows\n`)

  let translatedRows = 0
  let totalCalls = 0
  let errors = 0
  const startTime = Date.now()

  for (const row of rows as EmailRow[]) {
    const native = NATIVE_OF[row.account_id]
    if (!native) {
      console.warn(`Skipping row ${row.id.slice(0, 8)}: unknown account ${row.account_id}`)
      continue
    }

    const row2 = row as unknown as Record<string, string | null>
    const sourceSubject = row2[`subject_${native}`] ?? row.subject
    const sourceBody = row2[`body_${native}`] ?? row.body_plain
    const sourceSummary = row2[`ai_summary_${native}`] ?? row.ai_summary
    const sourceIntent = row2[`intent_${native}`] ?? row.intent

    if (!sourceSubject || !sourceBody) {
      console.warn(`Skipping ${row.id.slice(0, 8)}: missing source content in native locale ${native}`)
      continue
    }

    const source: TranslationPayload = {
      subject: sourceSubject,
      body: sourceBody,
      ai_summary: sourceSummary ?? '',
      intent: sourceIntent ?? '',
    }

    const updates: Record<string, string> = {}

    for (const target of ['it', 'en', 'es'] as const) {
      if (target === native) continue
      const existingSubject = row2[`subject_${target}`]
      const existingBody = row2[`body_${target}`]
      const isAlreadyTranslated =
        existingSubject &&
        existingSubject !== row.subject &&
        existingBody &&
        existingBody !== row.body_plain

      if (isAlreadyTranslated) {
        console.log(`  ${row.id.slice(0, 8)} → ${target}: already translated, skipping`)
        continue
      }

      try {
        console.log(`  ${row.id.slice(0, 8)} → ${target}: translating...`)
        const translated = await translate(source, native, target)
        updates[`subject_${target}`] = translated.subject
        updates[`body_${target}`] = translated.body
        updates[`ai_summary_${target}`] = translated.ai_summary
        updates[`intent_${target}`] = translated.intent
        totalCalls++
      } catch (err) {
        errors++
        console.error(`    ERROR translating ${row.id.slice(0, 8)} to ${target}:`, err instanceof Error ? err.message : err)
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('emails_mock')
        .update(updates)
        .eq('id', row.id)

      if (updateError) {
        console.error(`    DB update failed for ${row.id.slice(0, 8)}:`, updateError.message)
        errors++
      } else {
        translatedRows++
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\nDone in ${elapsed}s`)
  console.log(`Rows updated: ${translatedRows} / ${rows.length}`)
  console.log(`Total OpenAI calls: ${totalCalls}`)
  console.log(`Errors: ${errors}`)
  console.log(`Estimated cost: ~$${(totalCalls * 0.0008).toFixed(3)}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
