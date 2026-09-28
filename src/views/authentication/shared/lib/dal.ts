import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import 'server-only'

import { decrypt } from './session'

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
  if (!session?.jti) {
    redirect('/login')
  }

  return { isAuth: true, userId: session.jti, userRole: session.iss }
})
