'use client'

import { useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'
import { AlertCircle, Save, RefreshCw, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { initialSync, saveRulesAction } from '@/app/app/actions'

interface SettingsViewProps {
  userEmail: string
  rulesJson: string
}

export default function SettingsView({ userEmail, rulesJson }: SettingsViewProps) {
  const [rules, setRules] = useState(rulesJson)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [saving, startSave] = useTransition()
  const [syncing, startSync] = useTransition()

  function handleRulesChange(val: string) {
    setRules(val)
    try {
      JSON.parse(val)
      setJsonError(null)
    } catch {
      setJsonError('Invalid JSON')
    }
  }

  function handleSave() {
    startSave(async () => {
      const result = await saveRulesAction(rules)
      if (result?.error) toast.error(result.error)
      else toast.success('Rules saved')
    })
  }

  function handleSync() {
    startSync(async () => {
      const result = await initialSync()
      if (result?.error) toast.error(result.error)
      else toast.success('Sync complete')
    })
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl">
      <div>
        <h1 className="font-bold text-neon-blue" style={{ fontSize: 'var(--fs-page)' }}>
          Settings<span className="text-neon-pink">.</span>
        </h1>
      </div>

      {/* Account card */}
      <div className="glass rounded-lg p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Account</h2>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-white/40 mb-0.5 uppercase tracking-wider">Connected email</p>
            <p className="text-sm font-medium text-white">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="h-9 px-4 border-2 border-red-500/60 text-red-400 text-xs font-semibold uppercase tracking-wider hover:bg-red-500 hover:text-black transition-all duration-300 flex items-center gap-1.5"
          >
            <LogOut size={12} aria-hidden />
            Disconnect
          </button>
        </div>
      </div>

      {/* Classification rules card */}
      <div className="glass rounded-lg p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Classification Rules</h2>
        <p className="text-xs text-white/30">
          Format:{' '}
          <code className="bg-white/5 px-1.5 py-0.5 font-mono text-neon-blue/70">
            {`[{"from_contains": "boss@", "force_priority": "high"}]`}
          </code>
        </p>
        <textarea
          value={rules}
          onChange={(e) => handleRulesChange(e.target.value)}
          rows={8}
          className={`w-full bg-white/5 border px-3 py-2.5 text-white text-sm font-mono placeholder-white/20 focus:outline-none transition-colors duration-200 resize-none scrollbar-hide ${
            jsonError ? 'border-red-500/60' : 'border-white/20 focus:border-neon-blue'
          }`}
        />
        {jsonError && (
          <p className="flex items-center gap-1.5 text-red-400 text-xs">
            <AlertCircle size={12} aria-hidden />
            {jsonError}
          </p>
        )}
        <button
          disabled={!!jsonError || saving}
          onClick={handleSave}
          className="h-10 px-6 border-2 border-neon-blue text-white text-xs font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black transition-all duration-300 group disabled:opacity-40 flex items-center gap-2"
        >
          <span className="absolute inset-0 bg-neon-blue scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          <span className="relative z-10 flex items-center gap-2">
            <Save size={12} aria-hidden />
            {saving ? 'Saving...' : 'Save Rules'}
          </span>
        </button>
      </div>

      {/* Sync card */}
      <div className="glass rounded-lg p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Sync</h2>
        <p className="text-xs text-white/40">
          Download and classify the latest 100 emails from your Gmail inbox.
        </p>
        <button
          disabled={syncing}
          onClick={handleSync}
          className="h-10 px-6 border-2 border-neon-blue text-white text-xs font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black transition-all duration-300 group disabled:opacity-40 flex items-center gap-2"
        >
          <span className="absolute inset-0 bg-neon-blue scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          <span className="relative z-10 flex items-center gap-2">
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} aria-hidden />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </span>
        </button>
      </div>
    </div>
  )
}
