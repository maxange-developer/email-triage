'use client'

import { useState } from 'react'
import { useAccount } from '@/contexts/AccountContext'
import { ChevronDown, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AccountSwitcher() {
  const { accounts, activeAccount, switchAccount, addAccount } = useAccount()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 glass border border-white/10 hover:border-neon-gold/50 transition-all duration-200 group"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse shrink-0" />
        <span className="text-white/70 text-sm max-w-[180px] truncate">
          {activeAccount?.emailAddress ?? 'Select account'}
        </span>
        <ChevronDown
          size={14}
          className={cn('text-white/40 transition-transform duration-200 shrink-0', open && 'rotate-180')}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 z-50 bg-[#0a0a0a] border border-white/15 min-w-[260px] animate-fade-up shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <div className="p-2">
              <p className="text-white/30 text-xs uppercase tracking-widest px-3 py-2">Accounts</p>

              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={async () => {
                    await switchAccount(account.id)
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors duration-150 group"
                >
                  <div
                    className={cn(
                      'w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0 border',
                      account.id === activeAccount?.id
                        ? 'border-neon-gold text-neon-gold bg-neon-gold/10'
                        : 'border-white/20 text-white/50 bg-white/5',
                    )}
                  >
                    {account.emailAddress[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm truncate',
                        account.id === activeAccount?.id ? 'text-white' : 'text-white/60',
                      )}
                    >
                      {account.emailAddress}
                    </p>
                    {account.displayName && (
                      <p className="text-white/30 text-xs truncate">{account.displayName}</p>
                    )}
                  </div>

                  {account.id === activeAccount?.id && (
                    <Check size={14} className="text-neon-gold shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 p-2">
              <button
                onClick={() => {
                  setOpen(false)
                  addAccount()
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors duration-150 text-neon-gold/70 hover:text-neon-gold"
              >
                <div className="w-8 h-8 flex items-center justify-center border border-dashed border-neon-gold/40">
                  <Plus size={14} />
                </div>
                <span className="text-sm">Add account</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
