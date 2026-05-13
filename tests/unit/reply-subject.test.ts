import { describe, it, expect } from 'vitest'
import { buildReplySubject } from '@/lib/utils/reply-subject'

describe('buildReplySubject', () => {
  it('returns "Re:" for empty / nullish input', () => {
    expect(buildReplySubject('')).toBe('Re:')
    expect(buildReplySubject('   ')).toBe('Re:')
    expect(buildReplySubject(null)).toBe('Re:')
    expect(buildReplySubject(undefined)).toBe('Re:')
  })

  it('prepends "Re: " to a plain subject', () => {
    expect(buildReplySubject('Bug in production')).toBe('Re: Bug in production')
  })

  it('does not double-prefix when "Re:" is already present', () => {
    expect(buildReplySubject('Re: existing thread')).toBe('Re: existing thread')
  })

  it('treats "Re:" prefix as case-insensitive', () => {
    expect(buildReplySubject('RE: shouting reply')).toBe('RE: shouting reply')
    expect(buildReplySubject('re: lowercase reply')).toBe('re: lowercase reply')
    expect(buildReplySubject('rE: weird case')).toBe('rE: weird case')
  })

  it('accepts spacing variants around the colon ("Re :", "RE  :")', () => {
    expect(buildReplySubject('Re : with spaces')).toBe('Re : with spaces')
    expect(buildReplySubject('RE  :   weird spacing')).toBe('RE  :   weird spacing')
  })

  it('trims leading and trailing whitespace from the input', () => {
    expect(buildReplySubject('  important  ')).toBe('Re: important')
  })

  it('preserves emoji and unicode characters in subjects', () => {
    expect(buildReplySubject('🚨 urgent fix')).toBe('Re: 🚨 urgent fix')
    expect(buildReplySubject('Aggiornamento — bilancio €5k')).toBe('Re: Aggiornamento — bilancio €5k')
  })

  it('does NOT match "Reply:" or "Reservation:" as the Re: prefix', () => {
    expect(buildReplySubject('Reply: from John')).toBe('Re: Reply: from John')
    expect(buildReplySubject('Reservation confirmed')).toBe('Re: Reservation confirmed')
  })
})
