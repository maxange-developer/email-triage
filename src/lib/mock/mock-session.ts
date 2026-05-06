import type { GmailAccount } from '@/lib/types'

export const MOCK_ACCOUNTS: GmailAccount[] = [
  {
    id: 'account-001',
    userId: 'mock-user-001',
    emailAddress: 'massi@angel1.dev',
    displayName: 'Massi Angelone',
    isPrimary: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'account-002',
    userId: 'mock-user-001',
    emailAddress: 'work@angel1.dev',
    displayName: 'Angel1 Work',
    isPrimary: false,
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'account-003',
    userId: 'mock-user-001',
    emailAddress: 'support@angel1.dev',
    displayName: 'Angel1 Support',
    isPrimary: false,
    createdAt: '2024-01-03T00:00:00.000Z',
  },
]

export const MOCK_USER = {
  id: 'mock-user-001',
  email: 'test@angel1.dev',
  name: 'Massi Angelone',
  image: null as string | null,
  accessToken: 'mock-access-token',
  activeAccountId: 'account-001',
}

export function getMockSession() {
  return {
    user: {
      name: MOCK_USER.name,
      email: MOCK_USER.email,
      image: MOCK_USER.image,
    },
    accessToken: MOCK_USER.accessToken,
    expires: '2099-01-01T00:00:00.000Z',
  }
}
