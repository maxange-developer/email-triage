import { getAppSession } from '@/lib/auth/get-session'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAppSession()
  const userEmail = session?.user?.email ?? ''

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto scrollbar-hide p-6">{children}</main>
      </div>
    </div>
  )
}
