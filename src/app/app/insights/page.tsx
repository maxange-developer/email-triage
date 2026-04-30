import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getVolumeByDay, getCategoryBreakdown, getTopSenders, getAnalyticsSummary } from '@/lib/db/analytics'
import InsightsView from '@/components/insights/InsightsView'

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')
  const { days: daysParam } = await searchParams
  const days = [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30
  const userId = session.user.email
  const [volumeByDay, categoryBreakdown, topSenders, summary] = await Promise.all([
    getVolumeByDay(userId, days),
    getCategoryBreakdown(userId, days),
    getTopSenders(userId, days),
    getAnalyticsSummary(userId, days),
  ])
  return (
    <InsightsView
      volumeByDay={volumeByDay}
      categoryBreakdown={categoryBreakdown}
      topSenders={topSenders}
      summary={summary}
      days={days}
    />
  )
}
