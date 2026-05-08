'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Plus, X, Save, RefreshCw, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { initialSync, saveRulesAction, deleteAccountAction } from '@/app/app/actions'
import { useI18n } from '@/i18n/client'
import { useAccount } from '@/contexts/AccountContext'
import { cn } from '@/lib/utils'
import { CustomSelect } from '@/components/ui/custom-select'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

interface Rule {
  id: string
  from_contains: string
  force_priority: 'high' | 'medium' | 'low'
}

type RulesMap = Record<string, Rule[]>

interface SettingsViewProps {
  userEmail: string
  rulesJson: string
}

function parseRulesMap(json: string): RulesMap {
  try {
    const parsed = JSON.parse(json)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    const result: RulesMap = {}
    for (const [accountId, rawRules] of Object.entries(parsed)) {
      if (!Array.isArray(rawRules)) continue
      result[accountId] = rawRules
        .filter(
          (r): r is { from_contains: string; force_priority: string } =>
            typeof r?.from_contains === 'string' && typeof r?.force_priority === 'string',
        )
        .map((r, i) => ({
          id: String(i),
          from_contains: r.from_contains,
          force_priority: (['high', 'medium', 'low'].includes(r.force_priority)
            ? r.force_priority
            : 'medium') as 'high' | 'medium' | 'low',
        }))
    }
    return result
  } catch {
    return {}
  }
}

export default function SettingsView({ userEmail, rulesJson }: SettingsViewProps) {
  const router = useRouter()
  const { accounts, activeAccount, switchAccount, addAccount } = useAccount()
  const rulesMapRef = useRef<RulesMap>(parseRulesMap(rulesJson))
  const [rules, setRules] = useState<Rule[]>(
    () => rulesMapRef.current[activeAccount?.id ?? ''] ?? [],
  )
  const [saving, startSave] = useTransition()
  const [syncing, startSync] = useTransition()
  const { t } = useI18n()

  useEffect(() => {
    setRules(rulesMapRef.current[activeAccount?.id ?? ''] ?? [])
  }, [activeAccount?.id])

  function addRule() {
    setRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), from_contains: '', force_priority: 'medium' },
    ])
  }

  function removeRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRule(id: string, field: keyof Omit<Rule, 'id'>, value: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    )
  }

  function handleSave() {
    if (!activeAccount) return
    startSave(async () => {
      const payload = JSON.stringify(
        rules.map(({ from_contains, force_priority }) => ({ from_contains, force_priority })),
      )
      const result = await saveRulesAction(activeAccount.id, payload)
      if (result?.error) toast.error(result.error)
      else {
        // Update local ref so account switch after save shows correct rules
        rulesMapRef.current = { ...rulesMapRef.current, [activeAccount.id]: rules }
        toast.success(t.settings.rulesSaved)
      }
    })
  }

  function handleSync() {
    startSync(async () => {
      const result = await initialSync()
      if (result?.error) toast.error(result.error)
      else toast.success(t.settings.syncComplete)
    })
  }

  async function handleDeleteAccount(accountId: string) {
    if (USE_MOCK) {
      toast.error(t.settings.demoNotAvailable)
      return
    }
    const result = await deleteAccountAction(accountId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t.settings.accountRemoved)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl">
      <div>
        <h1 className="font-bold text-neon-green" style={{ fontSize: 'var(--fs-page)' }}>
          {t.settings.title}<span className="text-white">.</span>
        </h1>
      </div>

      {/* Connected accounts card */}
      <div className="glass p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">{t.settings.account}</h2>

        <div className="space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-widest">{t.settings.connectedAccounts}</p>

          {accounts.map((account) => (
            <div
              key={account.id}
              className={cn(
                'glass border-2 p-4 flex items-center gap-4 transition-all duration-200',
                account.id === activeAccount?.id
                  ? 'border-neon-green/60'
                  : 'border-white/10 hover:border-white/20',
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 flex items-center justify-center text-sm font-bold border shrink-0',
                  account.id === activeAccount?.id
                    ? 'border-neon-green text-neon-green bg-neon-green/10'
                    : 'border-white/20 text-white/50 bg-white/5',
                )}
              >
                {account.emailAddress[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate font-medium">{account.emailAddress}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {account.isPrimary && (
                    <span className="text-neon-green text-xs">{t.settings.primary}</span>
                  )}
                  {account.id === activeAccount?.id && (
                    <span className="text-neon-green text-xs">● {t.settings.active}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {account.id !== activeAccount?.id && (
                  <button
                    onClick={() => switchAccount(account.id)}
                    className="h-8 px-3 border border-neon-green/40 text-neon-green text-xs hover:bg-neon-green/10 transition-all duration-200"
                  >
                    {t.settings.switchAccount}
                  </button>
                )}
                {!account.isPrimary && (
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="h-8 px-3 border border-red-500/40 text-red-400 text-xs hover:bg-red-500/10 transition-all duration-200"
                  >
                    {t.settings.removeAccount}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addAccount}
            className="w-full py-3 border border-dashed border-white/20 text-white/40 text-sm hover:border-neon-green hover:text-neon-green transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus size={14} /> {t.settings.addAccount}
          </button>
        </div>

        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="h-9 px-4 border-2 border-red-500/60 text-red-400 text-xs font-semibold uppercase tracking-wider hover:bg-red-500 hover:text-black transition-all duration-300 flex items-center gap-1.5"
          >
            <LogOut size={12} aria-hidden />
            {t.settings.disconnect}
          </button>
        </div>
      </div>

      {/* Classification rules card */}
      <div className="glass p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
          {t.settings.classificationRules}
        </h2>
        <p className="text-xs text-white/30">{t.settings.rulesDescription}</p>
        {activeAccount && (
          <p className="text-xs text-white/40">
            {t.settings.rulesFor}{' '}
            <span className="text-neon-green">{activeAccount.emailAddress}</span>
          </p>
        )}

        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="glass border border-white/10 p-4 flex items-center gap-4">
              <div className="flex-1 flex items-center gap-3 flex-wrap min-w-0">
                <span className="text-white/40 text-xs uppercase tracking-widest shrink-0">
                  {t.settings.ifFromContains}
                </span>
                <input
                  value={rule.from_contains}
                  onChange={(e) => updateRule(rule.id, 'from_contains', e.target.value)}
                  className="flex-1 min-w-0 h-8 bg-white/5 border border-white/20 px-3 text-white text-sm focus:outline-none focus:border-neon-green transition-colors"
                  placeholder="boss@company.com"
                />
                <span className="text-white/40 text-xs uppercase tracking-widest shrink-0">
                  → {t.settings.priority}
                </span>
                <CustomSelect
                  value={rule.force_priority}
                  onChange={(v) => updateRule(rule.id, 'force_priority', v as Rule['force_priority'])}
                  options={[
                    { value: 'high', label: t.settings.high },
                    { value: 'medium', label: t.settings.medium },
                    { value: 'low', label: t.settings.low },
                  ]}
                />
              </div>
              <button
                onClick={() => removeRule(rule.id)}
                aria-label="Remove rule"
                className="text-white/30 hover:text-red-400 transition-colors duration-200 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addRule}
          className="w-full py-2.5 border border-dashed border-white/20 text-white/40 text-sm hover:border-neon-green hover:text-neon-green transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          {t.settings.addRule}
        </button>

        <button
          disabled={saving}
          onClick={handleSave}
          className="w-full h-10 border-2 border-neon-green text-white text-xs font-semibold uppercase tracking-wider relative overflow-hidden hover:text-white transition-all duration-300 group disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <span className="absolute inset-0 bg-neon-green scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          <span className="relative z-10 flex items-center gap-2">
            <Save size={12} aria-hidden />
            {saving ? t.settings.saving : t.settings.saveRules}
          </span>
        </button>
      </div>

      {/* Sync card */}
      <div className="glass p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">{t.settings.sync}</h2>
        <p className="text-xs text-white/40">
          {t.settings.syncDescription}
        </p>
        <button
          disabled={syncing}
          onClick={handleSync}
          className="h-10 px-6 border-2 border-neon-green text-white text-xs font-semibold uppercase tracking-wider relative overflow-hidden hover:text-white transition-all duration-300 group disabled:opacity-40 flex items-center gap-2"
        >
          <span className="absolute inset-0 bg-neon-green scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          <span className="relative z-10 flex items-center gap-2">
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} aria-hidden />
            {syncing ? t.settings.syncing : t.settings.syncNow}
          </span>
        </button>
      </div>
    </div>
  )
}
