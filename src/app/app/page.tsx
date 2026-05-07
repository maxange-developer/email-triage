export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAppSession } from '@/lib/auth/get-session'
import { getActiveAccountId } from '@/lib/db/gmail-accounts'
import { getEmailsGrouped, getEmailsGroupedByAccount } from '@/lib/db/emails'
import InboxView from '@/components/inbox/InboxView'

export default async function AppPage() {
  const session = await getAppSession()
  if (!session?.user?.email) redirect('/login')

  const userId = session.user.email

  let grouped: { high: import('@/lib/validations/email').EmailRow[]; medium: import('@/lib/validations/email').EmailRow[]; low: import('@/lib/validations/email').EmailRow[] }

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const cookieStore = await cookies()
    const accountId = cookieStore.get('mock_account_id')?.value ?? 'account-001'
    grouped = await getEmailsGroupedByAccount(accountId)
  } else {
    const activeAccountId = await getActiveAccountId(userId)
    grouped = activeAccountId
      ? await getEmailsGroupedByAccount(activeAccountId)
      : await getEmailsGrouped(userId)
  }

  return <InboxView initialEmails={grouped} userId={userId} />
}
