import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { refreshAccessToken } from '@/lib/gmail/client'
import { fetchMessages, fetchMessageDetail, parseMessage } from '@/lib/gmail/sync'
import { upsertEmails, saveHistoryId } from '@/lib/db/emails'
import { runClassification } from '@/lib/ai/run-classification'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const { data: users } = await db
    .from('users_settings')
    .select('user_id, google_refresh_token')
    .not('google_refresh_token', 'is', null)

  if (!users?.length) return NextResponse.json({ synced: 0 })

  let total = 0
  for (const user of users) {
    try {
      const { accessToken } = await refreshAccessToken(user.google_refresh_token!)
      const stubs = await fetchMessages(accessToken, 50)
      if (!stubs.length) continue
      const details = await Promise.all(
        stubs.slice(0, 10).map(s => fetchMessageDetail(accessToken, s.id!)),
      )
      await upsertEmails(user.user_id, details.map(parseMessage))
      if (details[0]?.historyId) await saveHistoryId(user.user_id, details[0].historyId)
      await runClassification(user.user_id)
      total++
    } catch {
      // per-user failure — don't abort others
    }
  }

  return NextResponse.json({ synced: total })
}
