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

// COST GUARD: pinned model. Estimated ~170 calls * $0.001 = ~$0.17 total
const MODEL = 'gpt-4o-mini-2024-07-18'

const LOCALE_INSTRUCTIONS: Record<'it' | 'en' | 'es', string> = {
  it: 'Italian. Use "Buongiorno"/"Salve"/"Ciao" appropriately. Sign off with the name "Massimiliano".',
  en: 'British English. Sign off with "Best regards, Massimiliano" or "Kind regards, Massimiliano".',
  es: 'Spanish (Spain). Use "Buenos días"/"Hola" appropriately. Sign off with "Saludos cordiales, Massimiliano" or "Saludos, Massimiliano".',
}

const TONE_INSTRUCTIONS = {
  friendly: `Friendly and warm tone. Use informal address ("tu" in IT/ES, casual "Hi/Hey" in EN). Use contractions where natural. Conversational sentences. Shows empathy. NOT casual to the point of unprofessional — still business-appropriate. Length: 3-6 sentences.`,
  formal: `Highly formal tone. Use formal address ("Lei" in IT, "usted" in ES, formal "Dear..." in EN). Avoid contractions. Complete, well-structured sentences with subordinate clauses where appropriate. Use formulaic openings ("Le scrivo in merito a...", "Le rispondo cordialmente...") and closings ("Resto a disposizione per ulteriori chiarimenti", "Cordiali saluti"). Length: 4-7 sentences.`,
}

interface EmailRow {
  id: string
  account_id: string
  priority: string
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
  ai_suggested_replies: {
    it?: { professional?: string; friendly?: string; formal?: string }
    en?: { professional?: string; friendly?: string; formal?: string }
    es?: { professional?: string; friendly?: string; formal?: string }
  } | null
}

async function generateBothTones(
  email: EmailRow,
  locale: 'it' | 'en' | 'es',
): Promise<{ friendly: string; formal: string }> {
  const row = email as unknown as Record<string, string | null>
  const subject = row[`subject_${locale}`] ?? email.subject
  const body = row[`body_${locale}`] ?? email.body_plain
  const intent = row[`intent_${locale}`] ?? email.intent
  const summary = row[`ai_summary_${locale}`] ?? email.ai_summary
  const referenceProfessional = email.ai_suggested_replies?.[locale]?.professional ?? ''

  const prompt = `You are helping Massimiliano, a freelance Italian developer based in Tenerife, draft replies to his business emails.

Email received (in ${locale === 'it' ? 'Italian' : locale === 'en' ? 'English' : 'Spanish'}):
Subject: ${subject}
Body: ${body}

What the sender wants: ${intent}
Summary: ${summary}

Reference 'professional' reply already written (for style/length calibration):
"${referenceProfessional}"

Generate TWO alternative replies in ${LOCALE_INSTRUCTIONS[locale]}

1. FRIENDLY VERSION
${TONE_INSTRUCTIONS.friendly}

2. FORMAL VERSION
${TONE_INSTRUCTIONS.formal}

Both replies must:
- Address the same intent as the professional reference
- Be coherent with what Massimiliano would realistically say
- Preserve any specific numbers, dates, or commitments from the reference
- NOT include subject line, greeting prefix like "Re:", or quoted original message
- Just the body of the reply, ready to send

Respond ONLY with valid JSON:
{
  "friendly": "...",
  "formal": "..."
}`

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: 'You are a professional email drafting assistant. Output only valid JSON with the two requested tone variants. No markdown, no explanations.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error('Empty response from OpenAI')

  const parsed = JSON.parse(raw) as { friendly: string; formal: string }
  if (!parsed.friendly || !parsed.formal) {
    throw new Error(`Incomplete generation: ${raw.slice(0, 200)}`)
  }
  return parsed
}

async function main() {
  console.log('Fetching emails...')
  const { data: rows, error } = await supabase
    .from('emails_mock')
    .select('*')

  if (error || !rows) {
    console.error(error)
    process.exit(1)
  }

  let processed = 0
  let skipped = 0
  let calls = 0
  let errors = 0
  const startTime = Date.now()

  for (const row of rows as EmailRow[]) {
    if (row.priority === 'spam') {
      skipped++
      continue
    }

    const matrix = row.ai_suggested_replies ?? { it: {}, en: {}, es: {} }
    const newMatrix = JSON.parse(JSON.stringify(matrix)) as typeof matrix
    let rowHasUpdates = false

    for (const locale of ['it', 'en', 'es'] as const) {
      const current = newMatrix[locale] ?? { professional: '', friendly: '', formal: '' }
      const needsFriendly = !current.friendly || current.friendly.trim() === ''
      const needsFormal = !current.formal || current.formal.trim() === ''

      if (!needsFriendly && !needsFormal) continue

      try {
        console.log(`  ${row.id.slice(0, 8)} / ${locale}: generating both tones...`)
        const generated = await generateBothTones(row, locale)
        calls++
        newMatrix[locale] = {
          professional: current.professional ?? '',
          friendly: needsFriendly ? generated.friendly : (current.friendly ?? ''),
          formal: needsFormal ? generated.formal : (current.formal ?? ''),
        }
        rowHasUpdates = true
      } catch (err) {
        errors++
        console.error(`    ERROR ${row.id.slice(0, 8)} / ${locale}:`, err instanceof Error ? err.message : err)
      }
    }

    if (rowHasUpdates) {
      const { error: updateError } = await supabase
        .from('emails_mock')
        .update({ ai_suggested_replies: newMatrix })
        .eq('id', row.id)

      if (updateError) {
        console.error(`    DB update failed ${row.id.slice(0, 8)}:`, updateError.message)
        errors++
      } else {
        processed++
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\nDone in ${elapsed}s`)
  console.log(`Rows updated: ${processed}`)
  console.log(`Rows skipped (spam): ${skipped}`)
  console.log(`OpenAI calls: ${calls}`)
  console.log(`Errors: ${errors}`)
  console.log(`Estimated cost: ~$${(calls * 0.001).toFixed(3)}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
