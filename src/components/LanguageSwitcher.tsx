'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useI18n, type Locale } from '@/i18n/client'

const LANGS: { code: Locale; label: string }[] = [
  { code: 'gb', label: 'English' },
  { code: 'it', label: 'Italian' },
  { code: 'es', label: 'Spanish' },
]

export default function LanguageSwitcher({ flagPriority }: { flagPriority?: boolean }) {
  const { locale, setLocale } = useI18n()

  return (
    <div className="flex items-center gap-1.5">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          aria-label={`Switch to ${label}`}
          className={cn(
            'w-7 h-7 rounded-full overflow-hidden border-2 transition-all duration-200',
            locale === code
              ? 'border-neon-green opacity-100'
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
            priority={flagPriority && locale === code}
          />
        </button>
      ))}
    </div>
  )
}
