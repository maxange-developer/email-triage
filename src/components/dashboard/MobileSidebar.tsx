'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { SidebarNav } from './Sidebar'

export default function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="md:hidden p-2 rounded-[4px] text-[var(--ink-3)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-2)] transition-colors duration-200"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={18} strokeWidth={1.5} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 bg-[var(--surface)] border-r border-[var(--hairline)]">
            <button
              className="absolute top-3 right-3 p-1.5 rounded-[4px] text-[var(--ink-3)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-2)] transition-colors duration-200"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={15} strokeWidth={1.5} />
            </button>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
