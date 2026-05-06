export const MOCK_USER = {
  id: 'mock-user-001',
  email: 'test@angel1.dev',
  name: 'Massi Angelone',
  image: null as string | null,
  accessToken: 'mock-access-token',
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
