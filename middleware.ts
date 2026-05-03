import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = Boolean(token)
  const isAdmin = token?.role === 'admin'
  const pathname = req.nextUrl.pathname

  const protectedRoutes = ['/profile', '/cart', '/checkout', '/orders']
  const adminApiPath = '/api/admin'

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith(adminApiPath) && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/admin/:path*',
  ],
}