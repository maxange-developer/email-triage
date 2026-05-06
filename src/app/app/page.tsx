export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getAppSession } from '@/lib/auth/get-session'
import { getEmailsGrouped } from '@/lib/db/emails'
import InboxView from '@/components/inbox/InboxView'

export default async function AppPage() {
  const session = await getAppSession()
  if (!session?.user?.email) redirect('/login')

  const userId = session.user.email
  const grouped = await getEmailsGrouped(userId)

  return <InboxView initialEmails={grouped} userId={userId} />
}
