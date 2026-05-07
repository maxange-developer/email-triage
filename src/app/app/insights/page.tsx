export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAppSession } from '@/lib/auth/get-session'
import { getActiveAccountId } from '@/lib/db/gmail-accounts'
import {
  getVolumeByDay, getVolumeByDayByAccount,
  getCategoryBreakdown, getCategoryBreakdownByAccount,
  getTopSenders, getTopSendersByAccount,
  getAnalyticsSummary, getAnalyticsSummaryByAccount,
} from '@/lib/db/analytics'
import InsightsView from '@/components/insights/InsightsView'

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const session = await getAppSession()
  if (!session?.user?.email) redirect('/login')

  const { days: daysParam } = await searchParams
  const days = [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30
  const userId = session.user.email

  let volumeByDay, categoryBreakdown, topSenders, summary

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const cookieStore = await cookies()
    const accountId = cookieStore.get('mock_account_id')?.value ?? 'account-001'
    ;[volumeByDay, categoryBreakdown, topSenders, summary] = await Promise.all([
      getVolumeByDayByAccount(accountId, days),
      getCategoryBreakdownByAccount(accountId, days),
      getTopSendersByAccount(accountId, days),
      getAnalyticsSummaryByAccount(accountId, days),
    ])
  } else {
    const activeAccountId = await getActiveAccountId(userId)
    if (activeAccountId) {
      ;[volumeByDay, categoryBreakdown, topSenders, summary] = await Promise.all([
        getVolumeByDayByAccount(activeAccountId, days),
        getCategoryBreakdownByAccount(activeAccountId, days),
        getTopSendersByAccount(activeAccountId, days),
        getAnalyticsSummaryByAccount(activeAccountId, days),
      ])
    } else {
      ;[volumeByDay, categoryBreakdown, topSenders, summary] = await Promise.all([
        getVolumeByDay(userId, days),
        getCategoryBreakdown(userId, days),
        getTopSenders(userId, days),
        getAnalyticsSummary(userId, days),
      ])
    }
  }

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
