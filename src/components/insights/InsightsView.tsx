'use client'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Badge } from '@/components/ui/badge'
import type { DayCount, CategoryCount, SenderRow, AnalyticsSummary } from '@/lib/db/analytics'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

interface InsightsViewProps {
  volumeByDay: DayCount[]
  categoryBreakdown: CategoryCount[]
  topSenders: SenderRow[]
  summary: AnalyticsSummary
  days: number
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
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
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Day filter */}
      <div className="flex gap-2">
        {[7, 30, 90].map(d => (
          <Link
            key={d}
            href={`/app/insights?days=${d}`}
            className={`px-3 py-1 rounded-md text-sm border transition-colors ${
              days === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
            }`}
          >
            {d}gg
          </Link>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Totale email" value={summary.total} />
        <StatCard
          label="Gestite"
          value={`${summary.handled} (${summary.total ? Math.round((summary.handled / summary.total) * 100) : 0}%)`}
        />
        <StatCard label="Spam" value={summary.spamCount} />
        <StatCard label="Urgenza media" value={`${summary.avgUrgencyHours}h`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volume bar chart */}
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="text-sm font-semibold">Volume per giorno</h3>
          {volumeByDay.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nessun dato</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={volumeByDay}>
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={l => `Data: ${l}`} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category donut */}
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="text-sm font-semibold">Categorie</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nessun dato</p>
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
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]} />
                <Legend formatter={v => String(v).replace(/_/g, ' ')} iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top senders */}
      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Top mittenti</h3>
        </div>
        {topSenders.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">Nessun dato</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Mittente</th>
                <th className="px-4 py-2 text-left font-medium">Email</th>
                <th className="px-4 py-2 text-right font-medium">N°</th>
                <th className="px-4 py-2 text-right font-medium">Priorità</th>
              </tr>
            </thead>
            <tbody>
              {topSenders.map(s => (
                <tr key={s.from_address} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{s.from_name ?? '—'}</td>
                  <td className="px-4 py-2 text-muted-foreground truncate max-w-[200px]">{s.from_address}</td>
                  <td className="px-4 py-2 text-right">{s.count}</td>
                  <td className="px-4 py-2 text-right">
                    {s.top_priority && (
                      <Badge variant={s.top_priority === 'high' ? 'destructive' : 'outline'}>
                        {s.top_priority}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
