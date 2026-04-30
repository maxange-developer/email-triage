'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/app', label: 'Inbox' },
  { href: '/app/insights', label: 'Insights' },
  { href: '/app/settings', label: 'Impostazioni' },
]

export default function AppNav() {
  const pathname = usePathname()
  return (
    <nav className="sticky top-0 z-20 bg-background border-b">
      <div className="max-w-5xl mx-auto px-4 flex gap-1 h-12 items-center">
        {links.map(({ href, label }) => {
          const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
