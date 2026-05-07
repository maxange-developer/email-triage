'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/client'

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()
  useEffect(() => setMounted(true), [])

  const NAV_ITEMS = [
    { href: '/app', label: t.nav.inbox, icon: Home, exact: true },
    { href: '/app/insights', label: t.nav.insights, icon: BarChart2, exact: false },
    { href: '/app/settings', label: t.nav.settings, icon: Settings, exact: false },
  ] as const

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-white/10 shrink-0">
        <Image
          src="/images/logo.webp"
          alt="Angel1"
          width={56}
          height={22}
          className="object-contain w-auto"
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = mounted && (exact ? pathname === href : pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 py-2.5 text-sm uppercase tracking-wider font-medium transition-all duration-200',
                isActive
                  ? 'text-neon-green opacity-100 bg-neon-green/10 border-l-2 border-neon-green pl-[calc(1.25rem-2px)] pr-4 rounded-r-lg'
                  : 'text-neon-green opacity-40 hover:opacity-70 px-5',
              )}
            >
              <Icon size={15} aria-hidden className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2 border-t border-white/10 mt-auto">
        <p className="text-[10px] text-white/25 uppercase tracking-widest">Email Triage</p>
      </div>
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-col glass border-r border-white/10 shrink-0">
      <SidebarNav />
    </aside>
  )
}
