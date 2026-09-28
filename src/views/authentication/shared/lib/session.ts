import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import 'server-only'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })

    return payload
  } catch (error) {
    console.log(`Failed to verify session, cause: ${error}`)
  }
}

export async function createSession(userId: string, userRole: string) {
  const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ jti: userId, iss: userRole })

  const cookie = await cookies()
  cookie.set('session', session, {
    httpOnly: true,
    secure: false, // REQUIRED for http (mobile LAN)
    expires: expireAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function updateSession() {
  const session = (await cookies()).get('session')?.value
  const payload = await decrypt(session)
  if (!session || !payload) return null

  const expires = new Date(Date.now() + 7 * 60 * 60 * 24 * 1000)

  const cookie = await cookies()
  cookie.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookie = await cookies()
  cookie.delete('session')
}
