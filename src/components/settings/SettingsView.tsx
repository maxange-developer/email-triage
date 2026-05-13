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

export default function SettingsView({ rulesJson }: SettingsViewProps) {
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1
          className="text-[32px] font-medium text-[var(--ink-1)]"
          style={{ letterSpacing: '-0.03em' }}
        >
          {t.settings.title}<span className="text-[var(--accent)]">.</span>
        </h1>
      </div>

      {/* Connected accounts card */}
      <div className="card-editorial p-6 space-y-4">
        <h2 className="eyebrow">{t.settings.account}</h2>

        <div className="space-y-3">
          <p className="eyebrow">{t.settings.connectedAccounts}</p>

          {accounts.map((account) => (
            <div
              key={account.id}
              className={cn(
                'card-editorial p-4 flex items-center gap-4',
                account.id === activeAccount?.id &&
                  'border-l-2 border-l-[var(--accent)] bg-[var(--accent-soft)]',
              )}
            >
              <div className="w-10 h-10 rounded-[4px] flex items-center justify-center text-sm font-medium border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
                {account.emailAddress[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[var(--ink-1)] text-sm truncate font-medium">{account.emailAddress}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {account.isPrimary && (
                    <span className="text-[var(--accent)] text-xs">{t.settings.primary}</span>
                  )}
                  {account.id === activeAccount?.id && (
                    <span className="text-[var(--accent)] text-xs">● {t.settings.active}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {account.id !== activeAccount?.id && (
                  <button
                    onClick={() => switchAccount(account.id)}
                    className="h-8 px-3 rounded-[4px] bg-[var(--accent)] text-white text-[12px] font-medium hover:bg-[var(--accent-2)] transition-colors duration-200"
                  >
                    {t.settings.switchAccount}
                  </button>
                )}
                {!account.isPrimary && (
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="h-8 px-3 rounded-[4px] border border-[var(--priority-high)]/40 text-[var(--priority-high)] text-[12px] hover:bg-[var(--priority-high-bg)] transition-colors duration-200"
                  >
                    {t.settings.removeAccount}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addAccount}
            className="w-full py-3 rounded-[4px] border border-dashed border-[var(--hairline-strong)] text-[var(--ink-3)] text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Plus size={14} strokeWidth={1.5} /> {t.settings.addAccount}
          </button>
        </div>

        <div className="pt-2 border-t border-[var(--hairline)] flex justify-end">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="h-9 px-4 rounded-[4px] border border-[var(--priority-high)]/40 text-[var(--priority-high)] text-[12px] font-medium hover:bg-[var(--priority-high-bg)] transition-colors duration-200 flex items-center gap-1.5"
          >
            <LogOut size={12} strokeWidth={1.5} aria-hidden />
            {t.settings.disconnect}
          </button>
        </div>
      </div>

      {/* Classification rules card */}
      <div className="card-editorial p-6 space-y-4">
        <h2 className="eyebrow">{t.settings.classificationRules}</h2>
        <p className="text-[12px] text-[var(--ink-3)]">{t.settings.rulesDescription}</p>
        {activeAccount && (
          <p className="text-[12px] text-[var(--ink-3)]">
            {t.settings.rulesFor}{' '}
            <span className="text-[var(--accent)]">{activeAccount.emailAddress}</span>
          </p>
        )}

        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="card-editorial p-4 flex items-center gap-4">
              <div className="flex-1 flex items-center gap-3 flex-wrap min-w-0">
                <span
                  className="text-[var(--ink-3)] text-[11px] uppercase tracking-[0.08em] shrink-0"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {t.settings.ifFromContains}
                </span>
                <input
                  value={rule.from_contains}
                  onChange={(e) => updateRule(rule.id, 'from_contains', e.target.value)}
                  className="flex-1 min-w-0 h-8 bg-[var(--surface)] border border-[var(--hairline)] rounded-[4px] px-3 text-[var(--ink-1)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors duration-200"
                  placeholder="boss@company.com"
                />
                <span
                  className="text-[var(--ink-3)] text-[11px] uppercase tracking-[0.08em] shrink-0"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
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
                className="text-[var(--ink-3)] hover:text-[var(--priority-high)] transition-colors duration-200 shrink-0"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addRule}
          className="w-full py-2.5 rounded-[4px] border border-dashed border-[var(--hairline-strong)] text-[var(--ink-3)] text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Plus size={14} strokeWidth={1.5} />
          {t.settings.addRule}
        </button>

        <button
          disabled={saving}
          onClick={handleSave}
          className="w-full h-10 rounded-[4px] bg-[var(--accent)] text-white text-[12px] font-medium hover:bg-[var(--accent-2)] transition-colors duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Save size={12} strokeWidth={1.5} aria-hidden />
          {saving ? t.settings.saving : t.settings.saveRules}
        </button>
      </div>

      {/* Sync card */}
      <div className="card-editorial p-6 space-y-4">
        <h2 className="eyebrow">{t.settings.sync}</h2>
        <p className="text-[12px] text-[var(--ink-3)]">
          {t.settings.syncDescription}
        </p>
        <button
          disabled={syncing}
          onClick={handleSync}
          className="h-10 px-6 rounded-[4px] bg-[var(--accent)] text-white text-[12px] font-medium hover:bg-[var(--accent-2)] transition-colors duration-200 disabled:opacity-40 flex items-center gap-2"
        >
          <RefreshCw size={12} strokeWidth={1.5} className={syncing ? 'animate-spin' : ''} aria-hidden />
          {syncing ? t.settings.syncing : t.settings.syncNow}
        </button>
      </div>
    </div>
  )
}
