import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserSettings } from '@/lib/db/settings'
import SettingsView from '@/components/settings/SettingsView'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')
  const settings = await getUserSettings(session.user.email)
  return (
    <SettingsView
      userEmail={session.user.email}
      rulesJson={JSON.stringify(settings.classification_rules, null, 2)}
    />
  )
}
