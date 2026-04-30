import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AppPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Inbox</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Connesso come {session.user?.email}
      </p>
    </main>
  )
}
