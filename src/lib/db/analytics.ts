import { createServiceClient } from '@/lib/supabase/service'

export interface DayCount { date: string; count: number }
export interface CategoryCount { category: string; count: number }
export interface SenderRow {
  from_address: string
  from_name: string | null
  count: number
  top_priority: string | null
}
export interface AnalyticsSummary {
  total: number
  handled: number
  spamCount: number
  avgUrgencyHours: number
}

function sinceDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export async function getVolumeByDay(userId: string, days = 30): Promise<DayCount[]> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('emails')
    .select('received_at')
    .eq('user_id', userId)
    .gte('received_at', sinceDate(days))
  if (error) throw new Error(`getVolumeByDay: ${error.message}`)

  // Build a map of date -> count from fetched rows
  const countMap = new Map<string, number>()
  for (const row of data ?? []) {
    if (!row.received_at) continue
    const date = (row.received_at as string).slice(0, 10)
    countMap.set(date, (countMap.get(date) ?? 0) + 1)
  }

  // Fill all days in range with 0 if missing so chart has no gaps
  const result: DayCount[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    result.push({ date, count: countMap.get(date) ?? 0 })
  }

  return result
}

export async function getCategoryBreakdown(userId: string, days = 30): Promise<CategoryCount[]> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('emails')
    .select('category')
    .eq('user_id', userId)
    .eq('is_processed', true)
    .gte('received_at', sinceDate(days))
  if (error) throw new Error(`getCategoryBreakdown: ${error.message}`)

  const countMap = new Map<string, number>()
  for (const row of data ?? []) {
    const cat = row.category as string | null
    if (!cat) continue
    countMap.set(cat, (countMap.get(cat) ?? 0) + 1)
  }

  return Array.from(countMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getTopSenders(userId: string, days = 30, limit = 10): Promise<SenderRow[]> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('emails')
    .select('from_address, from_name, priority')
    .eq('user_id', userId)
    .gte('received_at', sinceDate(days))
  if (error) throw new Error(`getTopSenders: ${error.message}`)

  // Aggregate by from_address, tracking from_name and priority counts
  const senderMap = new Map<string, { from_name: string | null; count: number; priorityCounts: Map<string, number> }>()

  for (const row of data ?? []) {
    const addr = row.from_address as string | null
    if (!addr) continue
    const existing = senderMap.get(addr)
    if (!existing) {
      const priorityCounts = new Map<string, number>()
      const priority = row.priority as string | null
      if (priority) priorityCounts.set(priority, 1)
      senderMap.set(addr, {
        from_name: row.from_name as string | null,
        count: 1,
        priorityCounts,
      })
    } else {
      existing.count++
      const priority = row.priority as string | null
      if (priority) {
        existing.priorityCounts.set(priority, (existing.priorityCounts.get(priority) ?? 0) + 1)
      }
    }
  }

  return Array.from(senderMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([from_address, info]) => {
      // Find the most common priority for this sender
      let top_priority: string | null = null
      let maxCount = 0
      for (const [priority, cnt] of info.priorityCounts.entries()) {
        if (cnt > maxCount) {
          maxCount = cnt
          top_priority = priority
        }
      }
      return {
        from_address,
        from_name: info.from_name,
        count: info.count,
        top_priority,
      }
    })
}

export async function getAnalyticsSummary(userId: string, days = 30): Promise<AnalyticsSummary> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('emails')
    .select('is_handled, priority, urgency_hours')
    .eq('user_id', userId)
    .gte('received_at', sinceDate(days))
  if (error) throw new Error(`getAnalyticsSummary: ${error.message}`)

  const rows = data ?? []
  const total = rows.length
  const handled = rows.filter(e => e.is_handled).length
  const spamCount = rows.filter(e => e.priority === 'spam').length

  const urgencyValues = rows
    .map(e => e.urgency_hours as number | null)
    .filter((v): v is number => v !== null)

  const avgUrgencyHours =
    urgencyValues.length > 0
      ? Math.round((urgencyValues.reduce((sum, v) => sum + v, 0) / urgencyValues.length) * 10) / 10
      : 0

  return { total, handled, spamCount, avgUrgencyHours }
}
