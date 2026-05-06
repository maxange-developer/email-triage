'use client'

import { createContext, useContext, useState, useEffect, ReactNode, createElement } from 'react'
import en from '../../messages/en.json'
import it from '../../messages/it.json'
import es from '../../messages/es.json'

export type Locale = 'gb' | 'it' | 'es'

const MESSAGES: Record<Locale, typeof en> = { gb: en, it, es }

const STORAGE_KEY = 'email-triage-locale'

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: typeof en
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'gb',
  setLocale: () => undefined,
  t: en,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('gb')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && saved in MESSAGES) setLocaleState(saved)
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }

  return createElement(
    I18nContext.Provider,
    { value: { locale, setLocale, t: MESSAGES[locale] } },
    children,
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
