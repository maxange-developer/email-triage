'use client'
import { useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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
      setJsonError('JSON non valido')
    }
  }

  function handleSave() {
    startSave(async () => {
      const result = await saveRulesAction(rules)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Regole salvate')
      }
    })
  }

  function handleSync() {
    startSync(async () => {
      const result = await initialSync()
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Sincronizzazione completata')
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-xl font-semibold">Impostazioni</h1>

      {/* Account */}
      <section className="space-y-3">
        <h2 className="text-base font-medium">Account</h2>
        <div className="rounded-lg border p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Email connessa</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
            Disconnetti
          </Button>
        </div>
      </section>

      <Separator />

      {/* Classification rules */}
      <section className="space-y-3">
        <h2 className="text-base font-medium">Regole di classificazione</h2>
        <p className="text-sm text-muted-foreground">
          Formato:{' '}
          <code className="text-xs bg-muted px-1 rounded">
            {`[{"from_contains": "boss@", "force_priority": "high"}]`}
          </code>
        </p>
        <Textarea
          value={rules}
          onChange={e => handleRulesChange(e.target.value)}
          rows={8}
          className={`font-mono text-xs resize-none ${jsonError ? 'border-destructive' : ''}`}
        />
        {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
        <Button disabled={!!jsonError || saving} onClick={handleSave}>
          {saving ? 'Salvataggio...' : 'Salva regole'}
        </Button>
      </section>

      <Separator />

      {/* Sync */}
      <section className="space-y-3">
        <h2 className="text-base font-medium">Sincronizzazione</h2>
        <p className="text-sm text-muted-foreground">
          Scarica e classifica le ultime 100 email dalla tua casella Gmail.
        </p>
        <Button variant="outline" disabled={syncing} onClick={handleSync}>
          {syncing ? 'Sincronizzazione...' : 'Sincronizza ora'}
        </Button>
      </section>
    </div>
  )
}
