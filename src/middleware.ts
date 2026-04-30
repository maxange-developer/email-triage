import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
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

export const config = { matcher: ['/app/:path*', '/login'] }
