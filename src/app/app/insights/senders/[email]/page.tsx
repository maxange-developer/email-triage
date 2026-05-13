export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAppSession } from '@/lib/auth/get-session'
import { getActiveAccountId } from '@/lib/db/gmail-accounts'
import {
  getSenderStatsByAccount,
  getSenderDetailByAccount,
} from '@/lib/db/analytics'
import SenderDetailView from '@/components/insights/SenderDetailView'

export default async function SenderDetailPage({
  params,
}: {
  params: Promise<{ email: string }>
}) {
  const session = await getAppSession()
  if (!session?.user?.email) redirect('/login')

  const { email: encodedEmail } = await params
  const fromAddress = decodeURIComponent(encodedEmail)
  const userId = session.user.email

  let accountId: string

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const cookieStore = await cookies()
    accountId = cookieStore.get('mock_account_id')?.value ?? 'account-001'
  } else {
    accountId = (await getActiveAccountId(userId)) ?? ''
  }

  const [stats, emails] = await Promise.all([
    getSenderStatsByAccount(accountId, fromAddress),
    getSenderDetailByAccount(accountId, fromAddress),
  ])

  return (
    <SenderDetailView
      fromAddress={fromAddress}
      fromName={emails[0]?.from_name ?? null}
      stats={stats}
      emails={emails}
    />
  )
}
