'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { GmailAccount } from '@/lib/types'
import { MOCK_ACCOUNTS } from '@/lib/mock/mock-session'

interface AccountContextValue {
  accounts: GmailAccount[]
  activeAccount: GmailAccount | null
  switchAccount: (accountId: string) => Promise<void>
  addAccount: () => void
  refreshAccounts: () => Promise<void>
}

const AccountContext = createContext<AccountContextValue | null>(null)

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export function AccountProvider({ children, initialAccountId }: { children: ReactNode; initialAccountId?: string | null }) {
  const router = useRouter()
  const [accounts, setAccounts] = useState<GmailAccount[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(initialAccountId ?? null)

  const activeAccount = accounts.find(a => a.id === activeAccountId) ?? accounts[0] ?? null

  const refreshAccounts = useCallback(async () => {
    if (USE_MOCK) {
      setAccounts(MOCK_ACCOUNTS)
      setActiveAccountId(prev => prev ?? MOCK_ACCOUNTS[0]?.id ?? null)
      return
    }
    // Real mode: fetched via server — accounts passed as initialAccountId prop
  }, [])

  useEffect(() => {
    refreshAccounts()
  }, [refreshAccounts])

  async function switchAccount(accountId: string) {
    setActiveAccountId(accountId)
    if (USE_MOCK) {
      // Persist active account via cookie so Server Components can read it on refresh
      document.cookie = `mock_account_id=${accountId}; path=/; max-age=86400`
    } else {
      // Persist to DB — fire and forget
      fetch('/api/accounts/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      }).catch(() => undefined)
    }
    // Re-fetch server data for the new account
    router.refresh()
  }

  function addAccount() {
    window.dispatchEvent(new Event('open-add-account-modal'))
  }

  return (
    <AccountContext.Provider value={{ accounts, activeAccount, switchAccount, addAccount, refreshAccounts }}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used inside AccountProvider')
  return ctx
}
