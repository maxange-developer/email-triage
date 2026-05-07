'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Shield } from 'lucide-react'
import { useAccount } from '@/contexts/AccountContext'

export default function AddAccountModal() {
  const [open, setOpen] = useState(false)
  const { refreshAccounts } = useAccount()

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-add-account-modal', handler)
    return () => window.removeEventListener('open-add-account-modal', handler)
  }, [])

  const handleGoogleAuth = () => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      setTimeout(() => {
        alert('Mock mode: account mock-003 added (support@angel1.dev)')
        setOpen(false)
        refreshAccounts()
      }, 1000)
      return
    }
    window.location.href = '/api/auth/add-account'
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass border border-neon-gold/30 w-full max-w-md animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-bold text-white text-lg">
            Add Gmail Account<span className="text-neon-gold">.</span>
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-white/40 hover:text-white transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="glass border border-white/10 p-4 flex items-start gap-3">
            <Shield size={16} className="text-neon-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium mb-1">Secure OAuth connection</p>
              <p className="text-white/50 text-xs leading-relaxed">
                We request read + send access to your Gmail. You can revoke access anytime from Google settings.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-white/40 text-xs uppercase tracking-widest">Permissions requested</p>
            {['Read your emails', 'Send emails on your behalf', 'Access Gmail labels'].map((perm) => (
              <div key={perm} className="flex items-center gap-2 text-white/60 text-sm">
                <div className="w-1.5 h-1.5 bg-neon-green rounded-full shrink-0" />
                {perm}
              </div>
            ))}
          </div>

          <button
            onClick={handleGoogleAuth}
            className="w-full py-3 border-2 border-neon-gold text-white text-sm font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black transition-all duration-300 group flex items-center justify-center gap-3"
          >
            <Mail size={16} className="relative z-10" />
            <span className="relative z-10">Connect with Google</span>
            <span className="absolute inset-0 bg-neon-gold scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
          </button>

          <p className="text-white/20 text-xs text-center">
            Only your emails are accessed. No data is shared.
          </p>
        </div>
      </div>
    </div>
  )
}
