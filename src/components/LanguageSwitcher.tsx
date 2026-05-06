'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const LANGS = [
  { code: 'gb', label: 'English' },
  { code: 'it', label: 'Italian' },
  { code: 'es', label: 'Spanish' },
]

export default function LanguageSwitcher() {
  const [current, setCurrent] = useState('gb')

  return (
    <div className="flex items-center gap-1.5">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setCurrent(code)}
          aria-label={`Switch to ${label}`}
          className={cn(
            'w-7 h-7 rounded-full overflow-hidden border-2 transition-all duration-200',
            current === code
              ? 'border-neon-blue opacity-100'
              : 'border-white/20 opacity-50 hover:opacity-80',
          )}
        >
          <Image
            src={`https://flagcdn.com/w40/${code}.png`}
            alt={label}
            width={28}
            height={28}
            className="w-full h-full object-cover"
            unoptimized
          />
        </button>
      ))}
    </div>
  )
}
