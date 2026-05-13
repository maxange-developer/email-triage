'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Settings } from 'lucide-react'
import { useI18n } from '@/i18n/client'
import { cn } from '@/lib/utils'

type NavIcon = React.ComponentType<{
  size?: number
  strokeWidth?: number
  'aria-hidden'?: boolean
  className?: string
}>

interface NavItem {
  href: string
  label: string
  icon: NavIcon
  exact?: boolean
}

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const { t } = useI18n()

  const NAV_ITEMS: NavItem[] = [
    { href: '/app', label: t.nav.inbox, icon: Home, exact: true },
    { href: '/app/insights', label: t.nav.insights, icon: BarChart2 },
    { href: '/app/settings', label: t.nav.settings, icon: Settings },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-[var(--hairline)] shrink-0">
        <Image
          src="/images/angel1-black.webp"
          alt="Angel1"
          width={120}
          height={48}
          className="object-contain w-auto h-auto"
          priority
        />
      </div>

      {/* Nav */}
      <div className="flex-1 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              onClick={() => onNavigate?.()}
              className={cn(
                'flex items-center gap-3 py-2.5 text-[13px] font-medium transition-colors duration-200',
                isActive
                  ? 'bg-[var(--accent-soft)] border-l-2 border-[var(--accent)] pl-[18px] pr-5 text-[var(--ink-1)]'
                  : 'px-5 text-[var(--ink-3)] hover:bg-[var(--surface-2)] hover:text-[var(--ink-2)]',
              )}
            >
              <Icon
                size={15}
                strokeWidth={1.5}
                aria-hidden
                className={cn(
                  'shrink-0 transition-colors duration-200',
                  isActive ? 'text-[var(--accent)]' : 'text-current',
                )}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2 border-t border-[var(--hairline)] mt-auto">
        <p
          className="text-[10px] text-[var(--ink-4)] uppercase tracking-wider"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Email Triage
        </p>
      </div>
    </div>
  )
}
