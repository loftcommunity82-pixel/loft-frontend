import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = [
  '/', '/jobs', '/companies', '/about', '/contact', '/auth',
  '/sign-in', '/sign-up', '/blocked',
]

const protectedRoutes = [
  '/dashboard', '/profile', '/settings', '/notifications',
  '/hiring-workflow', '/applications', '/messages', '/employer',
  '/jobs/create',
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const authToken = request.cookies.get('auth-token')?.value

  if (!authToken && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/auth', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js)$|_next).*)',
  ],
}
