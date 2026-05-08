import { type NextRequest, NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

const USE_MOCK = process.env.USE_MOCK_AUTH === 'true'

function mockMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Intercept NextAuth API calls — return mock JSON so NextAuth never runs
  // (GoogleProvider crashes with empty credentials in mock mode)
  if (pathname.startsWith('/api/auth')) {
    if (pathname === '/api/auth/session') {
      return NextResponse.json({
        user: { name: 'Massi Angelone', email: 'test@angel1.dev', image: null },
        accessToken: 'mock-access-token',
        expires: '2099-01-01T00:00:00.000Z',
      })
    }
    return NextResponse.json({})
  }

  const bypass = req.cookies.get('mock_bypass')?.value === 'true'
  if (pathname.startsWith('/app')) {
    if (bypass || USE_MOCK) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

const authMiddleware = withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname === '/login' && req.nextauth.token) {
      return NextResponse.redirect(new URL('/app', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) =>
        req.nextUrl.pathname.startsWith('/app') ? !!token : true,
    },
  },
)

export default USE_MOCK ? mockMiddleware : authMiddleware

export const config = { matcher: ['/app/:path*', '/login', '/api/auth/:path*'] }
