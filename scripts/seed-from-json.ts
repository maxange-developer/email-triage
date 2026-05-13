import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

function loadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const raw = fs.readFileSync(envPath, 'utf-8')
  const env: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

const env = loadEnv()
const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL']!,
  env['SUPABASE_SERVICE_ROLE_KEY']!,
)

interface DemoData {
  exported_at: string
  emails_mock: Record<string, unknown>[]
  gmail_accounts: Record<string, unknown>[]
  users_settings: Record<string, unknown>[] | Record<string, unknown> | null
}

async function main(): Promise<void> {
  const dataPath = path.join(process.cwd(), 'scripts/demo-data.json')
  const raw = fs.readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(raw) as DemoData

  process.stdout.write(`Loading demo data exported at ${data.exported_at}\n`)

  process.stdout.write('Clearing existing demo rows...\n')
  await supabase.from('emails_mock').delete().neq('id', '__never__')
  await supabase.from('gmail_accounts').delete().neq('id', '__never__')

  if (data.gmail_accounts.length > 0) {
    const { error } = await supabase.from('gmail_accounts').insert(data.gmail_accounts)
    if (error) {
      process.stderr.write(`gmail_accounts insert failed: ${error.message}\n`)
      process.exit(1)
    }
    process.stdout.write(`Inserted ${data.gmail_accounts.length} accounts\n`)
  }

  // users_settings: supports both old (object) and new (array) export shapes
  const settingsRows = Array.isArray(data.users_settings)
    ? data.users_settings
    : data.users_settings
      ? [data.users_settings]
      : []
  if (settingsRows.length > 0) {
    const { error } = await supabase.from('users_settings').upsert(settingsRows)
    if (error) {
      process.stderr.write(`users_settings upsert failed: ${error.message}\n`)
      process.exit(1)
    }
    process.stdout.write(`Upserted ${settingsRows.length} settings rows\n`)
  }

  const CHUNK = 50
  for (let i = 0; i < data.emails_mock.length; i += CHUNK) {
    const slice = data.emails_mock.slice(i, i + CHUNK)
    const { error } = await supabase.from('emails_mock').insert(slice)
    if (error) {
      process.stderr.write(`emails_mock chunk ${i}-${i + slice.length} failed: ${error.message}\n`)
      process.exit(1)
    }
  }
  process.stdout.write(`Inserted ${data.emails_mock.length} emails\n`)

  process.stdout.write('Demo data loaded successfully.\n')
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err}\n`)
  process.exit(1)
})
