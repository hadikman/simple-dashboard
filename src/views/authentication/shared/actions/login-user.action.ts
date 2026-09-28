'use server'

import { type TLoginUserData } from '../'
import { createSession } from '../server'

import { loginUser } from '../db/login-user.db'

export async function loginUserAction(formData: FormData) {
  const rawData: TLoginUserData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = await loginUser(rawData)

  if (result.success) {
    await createSession(result.user.id, result.user.role)
  }

  return result
}
