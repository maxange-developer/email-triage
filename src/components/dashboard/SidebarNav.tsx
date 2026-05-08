'use client'

import { useState, useEffect, useRef } from 'react'
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
  const navRef = useRef<HTMLDivElement>(null)
  const [beamItem, setBeamItem] = useState<string | null>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 44, opacity: 0 })

  const NAV_ITEMS: NavItem[] = [
    { href: '/app', label: t.nav.inbox, icon: Home, exact: true },
    { href: '/app/insights', label: t.nav.insights, icon: BarChart2 },
    { href: '/app/settings', label: t.nav.settings, icon: Settings },
  ]

  const activeIndex = NAV_ITEMS.findIndex(({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href + '/') || pathname === href,
  )

  useEffect(() => {
    if (!navRef.current || activeIndex === -1) return
    const links = navRef.current.querySelectorAll('a')
    const activeLink = links[activeIndex] as HTMLElement | undefined
    if (!activeLink) return

    const navRect = navRef.current.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    setIndicatorStyle({
      top: linkRect.top - navRect.top,
      height: linkRect.height,
      opacity: 1,
    })
  }, [activeIndex, pathname])

  function handleClick(href: string) {
    onNavigate?.()
    setTimeout(() => {
      setBeamItem(href)
      setTimeout(() => setBeamItem(null), 600)
    }, 250)
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
      <div ref={navRef} className="relative flex-1 py-2">
        {/* Sliding green indicator — absolute, outside items loop */}
        <motion.div
          className="absolute left-0 right-0 bg-neon-green pointer-events-none"
          animate={{
            top: indicatorStyle.top,
            height: indicatorStyle.height,
            opacity: indicatorStyle.opacity,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
          style={{ zIndex: 0 }}
        />

        {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => {
          const isActive = index === activeIndex

          return (
            <Link
              key={href}
              href={href}
              onClick={() => handleClick(href)}
              className="relative flex items-center gap-3 py-2.5 px-5 text-sm uppercase tracking-wider font-medium overflow-hidden"
            >
              {/* Beam click effect */}
              <AnimatePresence>
                {beamItem === href && (
                  <motion.div
                    key={`beam-${href}`}
                    className="absolute inset-y-0 left-0 w-full pointer-events-none"
                    style={{ zIndex: 2 }}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="absolute top-0 bottom-0 w-10"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                      }}
                      initial={{ left: '-2.5rem' }}
                      animate={{ left: '110%' }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Icon
                size={15}
                aria-hidden
                className={`shrink-0 relative z-10 transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-white/50'
                }`}
              />
              <span
                className={`relative z-10 transition-colors duration-150 ${
                  isActive ? 'text-white font-semibold' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2 border-t border-white/10 mt-auto">
        <p className="text-[10px] text-white/25 uppercase tracking-widest">Email Triage</p>
      </div>
    </div>
  )
}
