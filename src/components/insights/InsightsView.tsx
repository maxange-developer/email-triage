'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { DayCount, CategoryCount, SenderRow, AnalyticsSummary } from '@/lib/db/analytics'
import { useI18n } from '@/i18n/client'

const EDITORIAL_COLORS = [
  '#3B5BDB', // accent indigo
  '#9B2226', // deep red
  '#B8860B', // mustard
  '#1E5F5A', // teal
  '#7A2E2E', // burgundy
  '#5C5852', // ink-2
  '#8B857C', // ink-3
  '#C5CEF0', // accent-line
]

const PRIORITY_CHIP: Record<string, string> = {
  high: 'bg-[var(--priority-high-bg)] border border-[var(--priority-high)]/40 text-[var(--priority-high)]',
  medium: 'bg-[var(--priority-medium-bg)] border border-[var(--priority-medium)]/40 text-[var(--priority-medium)]',
  low: 'bg-transparent border border-[var(--hairline)] text-[var(--ink-3)]',
  spam: 'bg-transparent border border-[var(--hairline)] text-[var(--ink-3)]',
}

const MONO_FONT = "var(--font-mono)"

interface InsightsViewProps {
  volumeByDay: DayCount[]
  categoryBreakdown: CategoryCount[]
  topSenders: SenderRow[]
  summary: AnalyticsSummary
  days: number
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-editorial p-6">
      <p className="eyebrow mb-2">{label}</p>
      <p
        className="text-[36px] leading-none font-medium text-[var(--ink-1)]"
        style={{ letterSpacing: '-0.02em' }}
      >
        {value}
      </p>
    </div>
  )
}

function VolumeTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; fill: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  return (
    <div className="bg-[var(--surface)] border border-[var(--hairline)] rounded-[4px] p-3 text-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <p className="text-[var(--ink-3)] mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
      <p className="text-[var(--ink-1)] border-t border-[var(--hairline)] mt-2 pt-2">Total: {total}</p>
    </div>
  )
}

export default function InsightsView({
  volumeByDay,
  categoryBreakdown,
  topSenders,
  summary,
  days,
}: InsightsViewProps) {
  const { t } = useI18n()
  const router = useRouter()
  const handledPct = summary.total ? Math.round((summary.handled / summary.total) * 100) : 0

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(600)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const barSize = Math.min(
    Math.max(Math.floor((containerWidth - 60) / (volumeByDay.length || 1)) - 4, 4),
    32,
  )

  const isEmpty = volumeByDay.every(d => d.high === 0 && d.medium === 0 && d.low === 0)

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-up">
      {/* Header + day filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1
          className="text-[32px] font-medium text-[var(--ink-1)]"
          style={{ letterSpacing: '-0.03em' }}
        >
          {t.insights.title}<span className="text-[var(--accent)]">.</span>
        </h1>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/app/insights?days=${d}`}
              className={`h-9 px-4 rounded-[4px] text-[12px] uppercase tracking-[0.06em] border transition-colors duration-200 flex items-center ${
                days === d
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                  : 'border-[var(--hairline)] text-[var(--ink-2)] hover:border-[var(--hairline-strong)]'
              }`}
              style={{ fontFamily: MONO_FONT }}
            >
              {d}d
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t.insights.totalEmails} value={summary.total} />
        <StatCard label={t.insights.handled} value={`${handledPct}%`} />
        <StatCard label={t.insights.spam} value={summary.spamCount} />
        <StatCard label={t.insights.avgUrgency} value={`${summary.avgUrgencyHours}h`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volume stacked bar chart */}
        <div className="card-editorial p-5">
          <h3 className="eyebrow mb-4">
            {t.insights.volumeByDay}
          </h3>
          {isEmpty ? (
            <p className="text-sm text-[var(--ink-3)] py-8 text-center">{t.insights.noData}</p>
          ) : (
            <div ref={containerRef} className="w-full outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={volumeByDay} barSize={barSize} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
                    tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<VolumeTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
                  <Bar dataKey="high" stackId="a" fill="var(--priority-high)" name="High" />
                  <Bar dataKey="medium" stackId="a" fill="var(--priority-medium)" name="Medium" />
                  <Bar dataKey="low" stackId="a" fill="var(--hairline-strong)" name="Low" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category donut */}
        <div className="card-editorial p-5">
          <h3 className="eyebrow mb-4">
            {t.insights.categories}
          </h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-[var(--ink-3)] py-8 text-center">{t.insights.noData}</p>
          ) : (
            <div className="outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="count"
                    nameKey="category"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={EDITORIAL_COLORS[i % EDITORIAL_COLORS.length]} opacity={0.95} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 4,
                      fontSize: 12,
                      color: 'var(--ink-1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                    formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="square"
                    iconSize={8}
                    formatter={(v) => (
                      <span style={{ color: 'var(--ink-2)', fontSize: 11 }}>
                        {String(v).replace(/_/g, ' ')}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top senders */}
      <div className="card-editorial">
        <div className="px-5 py-4 border-b border-[var(--hairline)]">
          <h3 className="eyebrow">
            {t.insights.topSenders}
          </h3>
        </div>
        {topSenders.length === 0 ? (
          <p className="text-sm text-[var(--ink-3)] p-5">{t.insights.noData}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--hairline)]">
                  <th
                    className="px-5 py-3 text-left text-[11px] text-[var(--ink-3)] font-medium uppercase tracking-[0.08em]"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    {t.insights.sender}
                  </th>
                  <th
                    className="px-5 py-3 text-left text-[11px] text-[var(--ink-3)] font-medium uppercase tracking-[0.08em] hidden sm:table-cell"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    {t.insights.email}
                  </th>
                  <th
                    className="px-5 py-3 text-right text-[11px] text-[var(--ink-3)] font-medium uppercase tracking-[0.08em]"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    #
                  </th>
                  <th
                    className="px-5 py-3 text-right text-[11px] text-[var(--ink-3)] font-medium uppercase tracking-[0.08em]"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSenders.map((s) => (
                  <tr
                    key={s.from_address}
                    onClick={() => router.push(`/app/insights/senders/${encodeURIComponent(s.from_address)}`)}
                    className="border-b border-[var(--hairline)] last:border-0 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 font-medium text-[var(--ink-1)]">{s.from_name ?? '—'}</td>
                    <td className="px-5 py-3 text-[var(--ink-3)] truncate max-w-[200px] hidden sm:table-cell">{s.from_address}</td>
                    <td
                      className="px-5 py-3 text-right text-[var(--ink-1)]"
                      style={{ fontFamily: MONO_FONT }}
                    >
                      {s.count}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {s.top_priority && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-[0.06em] ${PRIORITY_CHIP[s.top_priority] ?? ''}`}
                          style={{ fontFamily: MONO_FONT }}
                        >
                          {s.top_priority}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
