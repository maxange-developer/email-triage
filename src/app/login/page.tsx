'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { Check } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { cn } from '@/lib/utils'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export default function LoginPage() {
  const router = useRouter()
  const [rememberMe, setRememberMe] = useState(false)

  function handleSignIn() {
    if (USE_MOCK) {
      router.push('/app')
      return
    }
    if (rememberMe) {
      document.cookie = 'remember_session=true; max-age=31536000; path=/'
    }
    signIn('google', { callbackUrl: '/app' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ThreeBackground />

      {/* Language switcher */}
      <div className="fixed top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      {/* Login card */}
      <div className="glass rounded-lg p-8 border border-neon-green/30 w-full max-w-sm space-y-6 animate-fade-up">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/logo-white.webp"
            alt="Angel1"
            width={80}
            height={32}
            className="object-contain w-auto"
            priority
          />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="font-bold text-neon-green" style={{ fontSize: 'var(--fs-page)' }}>
            Email Triage<span className="text-white">.</span>
          </h1>
          <p className="text-white/60 text-sm">
            Connect your Gmail inbox to get started.
          </p>
        </div>

        {/* OAuth info */}
        <p className="text-xs text-center text-white/30">
          Read-only Gmail access. Your data is never shared.
        </p>

        {/* Remember me */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={rememberMe}
            onClick={() => setRememberMe(!rememberMe)}
            className={cn(
              'w-4 h-4 border transition-all duration-200',
              'flex items-center justify-center shrink-0',
              rememberMe
                ? 'border-neon-green bg-neon-green/20'
                : 'border-white/30 hover:border-neon-green/50',
            )}
          >
            {rememberMe && <Check size={10} className="text-neon-green" />}
          </button>
          <label
            className="text-white/50 text-sm cursor-pointer hover:text-white/70 transition-colors"
            onClick={() => setRememberMe(!rememberMe)}
          >
            Remember me
          </label>
        </div>

        {/* Connect button */}
        <button
          onClick={handleSignIn}
          className="w-full h-12 border-2 border-neon-green text-white text-sm font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black transition-all duration-300 group"
        >
          <span className="absolute inset-0 bg-neon-green scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          <span className="relative z-10">Connect with Google</span>
        </button>
      </div>
    </div>
  )
}
