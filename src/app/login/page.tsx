'use client'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Email Triage</h1>
          <p className="text-sm text-muted-foreground">
            Connetti la tua casella Gmail per iniziare
          </p>
        </div>

        <Button
          className="w-full"
          onClick={() => signIn('google')}
        >
          Accedi con Google
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          L&apos;app accede alla tua casella Gmail in sola lettura per classificare
          le email con AI. I tuoi dati non vengono condivisi con terze parti.
        </p>
      </div>
    </div>
  )
}
