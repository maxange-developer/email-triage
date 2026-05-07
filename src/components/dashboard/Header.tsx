'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import MobileSidebar from './MobileSidebar'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AccountSwitcher from './AccountSwitcher'

export default function Header() {
  return (
    <header className="glass border-b border-white/10 px-6 h-16 flex items-center justify-between shrink-0">
      <MobileSidebar />
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <AccountSwitcher />
        <LanguageSwitcher />
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          aria-label="Sign out"
          className="p-2 text-white/40 hover:text-neon-green hover:bg-neon-green/8 transition-all duration-200"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
