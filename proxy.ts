import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { decrypt } from '@/views/authentication/server'

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const isLoginRoute = pathname === '/login'
  const isRootRoute = pathname === '/'
  const cookie = (await cookies()).get('session')?.value
  let session = null

  if (cookie) {
    try {
      session = await decrypt(cookie)
    } catch (err) {
      console.error('Failed to verify session: ', err)
    }
  }

  if (!session?.jti && !isLoginRoute)
    return NextResponse.redirect(new URL('/login', req.nextUrl))

  if (session?.jti && (isLoginRoute || isRootRoute))
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|webp|gif|svg)$).*)',
  ],
}
