import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const migrationsDir = join(process.cwd(), 'supabase/migrations')
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort()

const allSql = files
  .map(f => `-- === ${f} ===\n${readFileSync(join(migrationsDir, f), 'utf-8')}`)
  .join('\n\n')

async function tryExecSqlRpc(): Promise<boolean> {
  const { error } = await supabase.rpc('exec_sql', { query: 'select 1' })
  if (error && (error.code === 'PGRST202' || error.message.includes('exec_sql'))) {
    return false
  }
  return true
}

async function applyViaRpc() {
  for (const file of files) {
    console.log(`Applying ${file}...`)
    const sql = readFileSync(join(migrationsDir, file), 'utf-8')
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    let ok = true
    for (const statement of statements) {
      const { error } = await (supabase.rpc('exec_sql', { query: statement }) as unknown as Promise<{ error: { message: string } | null }>)
      if (error) {
        console.error(`  ✗ ${statement.slice(0, 80)}`)
        console.error(`    ${error.message}`)
        ok = false
      }
    }
    if (ok) console.log(`  ✓ ${file} applied`)
  }
}

async function main() {
  const rpcAvailable = await tryExecSqlRpc()

  if (rpcAvailable) {
    console.log('exec_sql RPC found — applying migrations via RPC...\n')
    await applyViaRpc()
    console.log('\nAll migrations done.')
  } else {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANUAL MIGRATION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exec_sql RPC non disponibile (normale per progetti Supabase freschi).

Vai su https://supabase.com → il tuo progetto
→ SQL Editor → New Query
Incolla il seguente SQL e clicca RUN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${allSql}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dopo aver eseguito il SQL, esegui:
  npx tsx scripts/seed-mock.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
