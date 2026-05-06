'use client'

const LANGS = [
  { code: 'gb', label: 'English', flag: '🇬🇧' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
]

export default function LanguageSwitcher() {
  return (
    <div className="flex items-center gap-1">
      {LANGS.map(({ code, label, flag }) => (
        <button
          key={code}
          aria-label={`Switch to ${label}`}
          className="w-6 h-6 flex items-center justify-center rounded-full overflow-hidden hover:scale-110 transition-transform opacity-50 hover:opacity-100 text-base leading-none"
        >
          {flag}
        </button>
      ))}
    </div>
  )
}
