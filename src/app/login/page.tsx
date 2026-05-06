'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ThreeBackground />

      {/* Language switcher */}
      <div className="fixed top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      {/* Login card */}
      <div className="glass rounded-lg p-8 border border-neon-blue/30 w-full max-w-sm space-y-6 animate-fade-up">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/logo-white.webp"
            width={80}
            height={32}
            alt="Angel1"
            className="object-contain"
            priority
          />
        </div>

        <div className="text-center space-y-2">
          <h1 className="font-bold text-neon-blue" style={{ fontSize: 'var(--fs-page)' }}>
            Email Triage<span className="text-neon-pink">.</span>
          </h1>
          <p className="text-white/60 text-sm">
            Connect your Gmail inbox to get started.
          </p>
        </div>

        {/* Google OAuth button */}
        <button
          onClick={() => signIn('google')}
          className="w-full h-12 border-2 border-neon-blue text-white text-sm font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black transition-all duration-300 group"
        >
          <span className="absolute inset-0 bg-neon-blue scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          <span className="relative z-10">Sign in with Google</span>
        </button>

        <p className="text-xs text-center text-white/30">
          Read-only Gmail access. Your data is never shared.
        </p>
      </div>
    </div>
  )
}
