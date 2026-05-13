'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import MobileSidebar from './MobileSidebar'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AccountSwitcher from './AccountSwitcher'

export default function Header() {
  return (
    <header className="bg-[var(--surface)] border-b border-[var(--hairline)] px-6 h-16 flex items-center justify-between shrink-0">
      <MobileSidebar />
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <AccountSwitcher />
        <LanguageSwitcher />
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          aria-label="Sign out"
          className="p-2 rounded-[4px] text-[var(--ink-3)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-2)] transition-colors duration-200"
        >
          <LogOut size={15} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
