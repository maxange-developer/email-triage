import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMockSession } from '@/lib/mock/mock-session'

export async function getAppSession() {
  if (process.env.USE_MOCK_AUTH === 'true') {
    return getMockSession()
  }
  return getServerSession(authOptions)
}
