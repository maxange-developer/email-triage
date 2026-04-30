export function formatRelative(dateString: string | null): string {
  if (!dateString) return ''
  const diff = Date.now() - new Date(dateString).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'ora'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m fa`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h fa`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}g fa`
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(new Date(dateString))
}
