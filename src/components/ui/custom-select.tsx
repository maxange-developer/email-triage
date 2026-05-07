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
        className="w-full h-8 flex items-center justify-between gap-2 px-3
                   bg-black border border-white/20 text-white text-sm
                   hover:border-neon-green/50 focus:outline-none focus:border-neon-green
                   transition-colors duration-200 cursor-pointer"
      >
        <span className="truncate">{selected?.label ?? '—'}</span>
        <ChevronDown
          size={14}
          className={cn('text-white/40 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50
                        bg-[#0a0a0a] border border-white/15
                        shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 text-sm text-left',
                'transition-colors duration-150',
                opt.value === value
                  ? 'text-neon-green bg-neon-green/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5',
              )}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check size={12} className="text-neon-green shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
