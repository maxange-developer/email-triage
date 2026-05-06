'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import MobileSidebar from './MobileSidebar'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface HeaderProps {
  userEmail: string
}

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
      <MobileSidebar />
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-xs text-white/40 truncate max-w-[200px]">
          {userEmail}
        </span>
        <LanguageSwitcher />
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          aria-label="Sign out"
          className="p-2 text-white/40 hover:text-neon-blue hover:bg-neon-blue/8 transition-all duration-200"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
