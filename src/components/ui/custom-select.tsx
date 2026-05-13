'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
}

export function CustomSelect({ value, onChange, options, className }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-8 flex items-center justify-between gap-2 px-3 rounded-[4px]
                   bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink-1)] text-[14px]
                   hover:border-[var(--hairline-strong)] focus:outline-none focus:border-[var(--accent)]
                   transition-colors duration-200 cursor-pointer"
      >
        <span className="truncate">{selected?.label ?? '—'}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={cn('text-[var(--ink-3)] shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-50 rounded-[4px]
                     bg-[var(--surface)] border border-[var(--hairline)] overflow-hidden"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors duration-150',
                opt.value === value
                  ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-2)]',
              )}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check size={12} strokeWidth={1.5} className="text-[var(--accent)] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
