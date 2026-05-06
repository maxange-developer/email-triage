export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import { getAppSession } from '@/lib/auth/get-session'
import { getEmailById } from '@/lib/db/emails'
import EmailDetail from '@/components/email-detail/EmailDetail'

export default async function EmailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAppSession()
  if (!session?.user?.email) redirect('/login')

  const { id } = await params
  const email = await getEmailById(id)
  if (!email) notFound()

  return <EmailDetail email={email} />
}
