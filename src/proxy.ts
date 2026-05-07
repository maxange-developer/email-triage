import { type NextRequest, NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

const USE_MOCK = process.env.USE_MOCK_AUTH === 'true'

function mockMiddleware(req: NextRequest) {
  const bypass = req.cookies.get('mock_bypass')?.value === 'true'
  if (req.nextUrl.pathname.startsWith('/app')) {
    // Allow /app/* only if cookie is set (user clicked "Enter Demo")
    if (bypass || USE_MOCK) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', req.url))
  }
  // /login always visible — no auto-redirect
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
