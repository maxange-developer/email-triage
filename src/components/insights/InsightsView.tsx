'use client'

import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { DayCount, CategoryCount, SenderRow, AnalyticsSummary } from '@/lib/db/analytics'

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
    <div className="glass p-5 border-2 border-white/10 hover:border-neon-blue/50 transition-colors duration-300 hover-lift">
      <p className="text-xs uppercase tracking-widest text-white/40 mb-2">{label}</p>
      <p className="text-4xl font-bold text-neon-blue">{value}</p>
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
  const handledPct = summary.total ? Math.round((summary.handled / summary.total) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header + day filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-bold text-neon-blue" style={{ fontSize: 'var(--fs-page)' }}>
          Insights<span className="text-neon-pink">.</span>
        </h1>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/app/insights?days=${d}`}
              className={`h-9 px-4 text-xs font-semibold uppercase tracking-wider border transition-all duration-200 flex items-center ${
                days === d
                  ? 'border-neon-blue bg-neon-blue text-black'
                  : 'border-white/20 text-white/60 hover:border-neon-blue hover:text-white'
              }`}
            >
              {d}d
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Emails" value={summary.total} />
        <StatCard label="Handled" value={`${handledPct}%`} />
        <StatCard label="Spam" value={summary.spamCount} />
        <StatCard label="Avg Urgency" value={`${summary.avgUrgencyHours}h`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volume stacked bar chart */}
        <div className="glass p-5 border-2 border-white/10">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
            Volume by Day
          </h3>
          {volumeByDay.every(d => d.high === 0 && d.medium === 0 && d.low === 0) ? (
            <p className="text-sm text-white/30 py-8 text-center">No data</p>
          ) : (
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={volumeByDay} barSize={8}>
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
            Categories
          </h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-white/30 py-8 text-center">No data</p>
          ) : (
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
          )}
        </div>
      </div>

      {/* Top senders */}
      <div className="glass border-2 border-white/10">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            Top Senders
          </h3>
        </div>
        {topSenders.length === 0 ? (
          <p className="text-sm text-white/30 p-5">No data</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-left text-xs text-white/30 font-medium uppercase tracking-wider">Sender</th>
                  <th className="px-5 py-3 text-left text-xs text-white/30 font-medium uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 text-right text-xs text-white/30 font-medium uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-right text-xs text-white/30 font-medium uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody>
                {topSenders.map((s) => (
                  <tr key={s.from_address} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 font-medium text-white">{s.from_name ?? '—'}</td>
                    <td className="px-5 py-3 text-white/40 truncate max-w-[200px] hidden sm:table-cell">{s.from_address}</td>
                    <td className="px-5 py-3 text-right text-neon-blue font-mono">{s.count}</td>
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
