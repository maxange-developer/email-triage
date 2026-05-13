/**
 * Prepend "Re: " to subject if not already present.
 * Case-insensitive check on the standard "Re:" prefix
 * (avoids double-prefixing "Re: Re: ...").
 */
export function buildReplySubject(originalSubject: string | null | undefined): string {
  const subj = (originalSubject ?? '').trim()
  if (!subj) return 'Re:'
  if (/^re\s*:\s*/i.test(subj)) return subj
  return `Re: ${subj}`
}
