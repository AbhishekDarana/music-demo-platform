import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  const token = request.cookies.get('token')?.value

  const isLoginPage = path === '/admin/login'
  const isDashboardPage = path.startsWith('/admin/dashboard')

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.nextUrl))
  }

  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/login',
    '/admin/dashboard/:path*', 
  ],
}