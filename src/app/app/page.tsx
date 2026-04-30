import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEmailsGrouped } from '@/lib/db/emails'
import InboxView from '@/components/inbox/InboxView'

export default async function AppPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const userId = session.user.email
  const grouped = await getEmailsGrouped(userId)

  return <InboxView initialEmails={grouped} userId={userId} />
}
