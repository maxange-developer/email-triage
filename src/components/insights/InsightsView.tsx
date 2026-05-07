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

const NEON_COLORS = ['#ff00ff', '#00f0ff', '#00ff41', '#f59e0b', '#a78bfa', '#f472b6', '#34d399', '#60a5fa']

interface InsightsViewProps {
  volumeByDay: DayCount[]
  categoryBreakdown: CategoryCount[]
  topSenders: SenderRow[]
  summary: AnalyticsSummary
  days: number
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass p-5 border-2 border-white/10 hover:border-neon-green/50 transition-colors duration-300 hover-lift">
      <p className="text-xs uppercase tracking-widest text-white/40 mb-2">{label}</p>
      <p className="text-4xl font-bold text-neon-green">{value}</p>
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
    <div className="glass border border-white/10 p-3 text-xs">
      <p className="text-white/60 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
      <p className="text-white border-t border-white/10 mt-2 pt-2">Total: {total}</p>
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
    <div className="space-y-6 animate-fade-up">
      {/* Header + day filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-bold text-neon-green" style={{ fontSize: 'var(--fs-page)' }}>
          {t.insights.title}<span className="text-white">.</span>
        </h1>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/app/insights?days=${d}`}
              className={`h-9 px-4 text-xs font-semibold uppercase tracking-wider border transition-all duration-200 flex items-center ${
                days === d
                  ? 'border-neon-green bg-neon-green text-black'
                  : 'border-white/20 text-white/60 hover:border-neon-green hover:text-white'
              }`}
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
        <div className="glass p-5 border-2 border-white/10">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
            {t.insights.volumeByDay}
          </h3>
          {isEmpty ? (
            <p className="text-sm text-white/30 py-8 text-center">{t.insights.noData}</p>
          ) : (
            <div ref={containerRef} className="w-full outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={volumeByDay} barSize={barSize} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<VolumeTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="high" stackId="a" fill="#ef4444" name="High" />
                  <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                  <Bar dataKey="low" stackId="a" fill="rgba(255,255,255,0.2)" name="Low" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category donut */}
        <div className="glass p-5 border-2 border-white/10">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
            {t.insights.categories}
          </h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-white/30 py-8 text-center">{t.insights.noData}</p>
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
                    <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 0,
                    fontSize: 12,
                    color: '#fff',
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
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
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
      <div className="glass border-2 border-white/10">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            {t.insights.topSenders}
          </h3>
        </div>
        {topSenders.length === 0 ? (
          <p className="text-sm text-white/30 p-5">{t.insights.noData}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-left text-xs text-white/30 font-medium uppercase tracking-wider">{t.insights.sender}</th>
                  <th className="px-5 py-3 text-left text-xs text-white/30 font-medium uppercase tracking-wider hidden sm:table-cell">{t.insights.email}</th>
                  <th className="px-5 py-3 text-right text-xs text-white/30 font-medium uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-right text-xs text-white/30 font-medium uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody>
                {topSenders.map((s) => (
                  <tr
                    key={s.from_address}
                    onClick={() => router.push(`/app/insights/senders/${encodeURIComponent(s.from_address)}`)}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 hover:border-neon-green/20 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 font-medium text-white">{s.from_name ?? '—'}</td>
                    <td className="px-5 py-3 text-white/40 truncate max-w-[200px] hidden sm:table-cell">{s.from_address}</td>
                    <td className="px-5 py-3 text-right text-neon-green font-mono">{s.count}</td>
                    <td className="px-5 py-3 text-right">
                      {s.top_priority && (
                        <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider ${
                          s.top_priority === 'high'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/5 text-white/40 border border-white/10'
                        }`}>
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
