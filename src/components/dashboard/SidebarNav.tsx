'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, BarChart2, Settings } from 'lucide-react'
import { useI18n } from '@/i18n/client'

type NavIcon = React.ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>

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
  const [beamKey, setBeamKey] = useState<string | null>(null)

  const NAV_ITEMS: NavItem[] = [
    { href: '/app', label: t.nav.inbox, icon: Home, exact: true },
    { href: '/app/insights', label: t.nav.insights, icon: BarChart2 },
    { href: '/app/settings', label: t.nav.settings, icon: Settings },
  ]

  const activeIndex = NAV_ITEMS.findIndex(({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href),
  )

  function handleClick(href: string) {
    setBeamKey(`${href}-${Date.now()}`)
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-white/10 shrink-0">
        <Image
          src="/images/logo-a1-w.webp"
          alt="Angel1"
          width={120}
          height={48}
          className="object-contain w-auto h-auto"
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => {
          const isActive = index === activeIndex

          return (
            <Link
              key={href}
              href={href}
              onClick={() => handleClick(href)}
              className="relative flex items-center gap-3 py-2.5 px-5 text-sm uppercase tracking-wider font-medium overflow-hidden"
            >
              {/* Sliding background indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 bg-white/10 border-l-2 border-white"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}

              {/* Hover bg for inactive */}
              {!isActive && (
                <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors duration-200" />
              )}

              {/* Beam on click */}
              <AnimatePresence>
                {beamKey && beamKey.startsWith(href + '-') && (
                  <motion.div
                    key={beamKey}
                    className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                    initial={{ x: '-100%', opacity: 1 }}
                    animate={{ x: '100%', opacity: 0 }}
                    exit={{}}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    onAnimationComplete={() => setBeamKey(null)}
                  />
                )}
              </AnimatePresence>

              <Icon
                size={15}
                aria-hidden
                className={`shrink-0 relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-white/50'
                }`}
              />
              <span
                className={`relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {label}
              </span>
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
