'use client'

import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { DayCount, CategoryCount, SenderRow, AnalyticsSummary } from '@/lib/db/analytics'

const NEON_COLORS = ['#00f0ff', '#ff00ff', '#00ff41', '#f59e0b', '#a78bfa', '#f472b6', '#34d399', '#60a5fa']

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(0,0,0,0.85)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    fontSize: 12,
    color: '#fff',
  },
}

interface InsightsViewProps {
  volumeByDay: DayCount[]
  categoryBreakdown: CategoryCount[]
  topSenders: SenderRow[]
  summary: AnalyticsSummary
  days: number
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-lg p-5 border-2 border-white/10 hover:border-neon-blue/50 transition-colors duration-300 hover-lift">
      <p className="text-xs uppercase tracking-widest text-white/40 mb-2">{label}</p>
      <p className="text-4xl font-bold text-neon-blue">{value}</p>
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
        {/* Volume bar chart */}
        <div className="glass rounded-lg p-5 border-2 border-white/10">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
            Volume by Day
          </h3>
          {volumeByDay.length === 0 ? (
            <p className="text-sm text-white/30 py-8 text-center">No data</p>
          ) : (
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={volumeByDay}>
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
                    width={30}
                  />
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    cursor={{ fill: 'rgba(0,240,255,0.05)' }}
                    labelFormatter={(l) => `Date: ${l}`}
                  />
                  <Bar dataKey="count" fill="#00f0ff" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category donut */}
        <div className="glass rounded-lg p-5 border-2 border-white/10">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
            Categories
          </h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-white/30 py-8 text-center">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="count"
                  nameKey="category"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]}
                />
                <Legend
                  formatter={(v) => String(v).replace(/_/g, ' ')}
                  iconSize={10}
                  wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top senders */}
      <div className="glass rounded-lg border-2 border-white/10">
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
