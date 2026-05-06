import { NextResponse } from 'next/server'
import { getAppSession } from '@/lib/auth/get-session'
import { runClassification } from '@/lib/ai/run-classification'

export async function POST() {
  const session = await getAppSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await runClassification(session.user.email)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
