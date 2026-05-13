'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Shield, ExternalLink } from 'lucide-react'
import { useI18n } from '@/i18n/client'

type DemoView = 'connect' | 'limit'

const SOURCE_URL = 'https://github.com/maxange-developer/email-triage'

export default function AddAccountModal() {
  const [open, setOpen] = useState(false)
  const [demoView, setDemoView] = useState<DemoView>('connect')
  const { t } = useI18n()

  useEffect(() => {
    const handler = () => {
      setDemoView('connect')
      setOpen(true)
    }
    window.addEventListener('open-add-account-modal', handler)
    return () => window.removeEventListener('open-add-account-modal', handler)
  }, [])

  function handleClose() {
    setOpen(false)
  }

  function handleGoogleAuth() {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      setDemoView('limit')
      return
    }
    window.location.href = '/api/auth/add-account'
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-[var(--surface)] border border-[var(--hairline-strong)] rounded-[4px] w-full max-w-md animate-fade-up"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--hairline)]">
          <h2
            className="text-[18px] font-medium text-[var(--ink-1)]"
            style={{ letterSpacing: '-0.02em' }}
          >
            {demoView === 'limit' ? t.modal.demoLimit.eyebrow : t.modal.title}
            <span className="text-[var(--accent)]">.</span>
          </h2>
          <button
            onClick={handleClose}
            className="text-[var(--ink-3)] hover:text-[var(--ink-1)] transition-colors duration-200"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {demoView === 'connect' && (
          <div className="p-6 space-y-6">
            <div className="card-editorial p-4 flex items-start gap-3">
              <Shield size={16} strokeWidth={1.5} className="text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <p className="text-[var(--ink-1)] text-sm font-medium mb-1">{t.modal.oauthTitle}</p>
                <p className="text-[var(--ink-2)] text-[12px] leading-relaxed">
                  {t.modal.oauthDesc}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="eyebrow">{t.modal.permissionsLabel}</p>
              {t.modal.permissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2 text-[var(--ink-2)] text-sm">
                  <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full shrink-0" />
                  {perm}
                </div>
              ))}
            </div>

            <button
              onClick={handleGoogleAuth}
              className="w-full h-11 rounded-[4px] bg-[var(--accent)] text-white text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-[var(--accent-2)] transition-colors duration-200"
            >
              <Mail size={15} strokeWidth={1.5} />
              <span>{t.modal.cta}</span>
            </button>

            <p className="text-[var(--ink-3)] text-[11px] text-center">
              {t.modal.privacy}
            </p>
          </div>
        )}

        {demoView === 'limit' && (
          <div className="p-6 flex flex-col gap-5">
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.08em] text-[var(--accent)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {t.modal.demoLimit.eyebrow}
              </p>
              <h3
                className="mt-3 text-[24px] leading-[1.2] font-medium text-[var(--ink-1)]"
                style={{ letterSpacing: '-0.02em' }}
              >
                {t.modal.demoLimit.title}
              </h3>
            </div>

            <p className="text-[15px] leading-[1.6] text-[var(--ink-2)]">
              {t.modal.demoLimit.body}
            </p>

            <div className="flex gap-2 pt-2">
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-5 rounded-[4px] bg-[var(--accent)] text-white text-[13px] font-medium flex items-center gap-2 hover:bg-[var(--accent-2)] transition-colors duration-200"
              >
                {t.modal.demoLimit.viewSource}
                <ExternalLink size={14} strokeWidth={1.5} aria-hidden />
              </a>
              <button
                onClick={handleClose}
                className="h-10 px-5 rounded-[4px] border border-[var(--hairline)] text-[var(--ink-2)] text-[13px] hover:border-[var(--hairline-strong)] hover:bg-[var(--surface-2)] transition-colors duration-200"
              >
                {t.modal.demoLimit.close}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
