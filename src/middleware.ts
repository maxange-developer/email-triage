import { type NextRequest, NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

const USE_MOCK = process.env.USE_MOCK_AUTH === 'true'

function mockMiddleware(req: NextRequest) {
  // In mock mode redirect /login → /app; let all /app/* through
  if (req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/app', req.url))
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

export const config = { matcher: ['/app/:path*', '/login'] }
