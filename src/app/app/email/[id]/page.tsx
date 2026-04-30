import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getEmailById } from '@/lib/db/emails'
import EmailDetail from '@/components/email-detail/EmailDetail'

export default async function EmailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const { id } = await params
  const email = await getEmailById(id)
  if (!email) notFound()

  return <EmailDetail email={email} />
}
