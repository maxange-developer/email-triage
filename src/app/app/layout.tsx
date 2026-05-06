import { getAppSession } from '@/lib/auth/get-session'
import { getActiveAccountId } from '@/lib/db/gmail-accounts'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import AddAccountModal from '@/components/dashboard/AddAccountModal'
import { AccountProvider } from '@/contexts/AccountContext'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAppSession()
  const userEmail = session?.user?.email ?? ''

  let initialAccountId: string | null = null
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    initialAccountId = 'account-001'
  } else if (userEmail) {
    initialAccountId = await getActiveAccountId(userEmail)
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <AccountProvider initialAccountId={initialAccountId}>
          <Header />
          <main className="flex-1 overflow-y-auto scrollbar-hide p-6">{children}</main>
          <AddAccountModal />
        </AccountProvider>
      </div>
    </div>
  )
}
