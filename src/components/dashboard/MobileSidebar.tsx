'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setOpen(false)}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs bg-[var(--surface)] border-r border-[var(--hairline)]"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            >
              <button
                className="absolute top-3 right-3 p-1.5 rounded-[4px] text-[var(--ink-3)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-2)] transition-colors duration-200"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={15} strokeWidth={1.5} />
              </button>
              <SidebarNav onNavigate={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
