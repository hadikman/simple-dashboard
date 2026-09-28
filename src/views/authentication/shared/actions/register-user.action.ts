'use server'

import { type TRegisterUserData } from '../'
import { createSession } from '../server'

import { registerUser } from '../db/register-user.db'

export async function registerUserAction(formData: FormData) {
  const rawData: TRegisterUserData = {
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = await registerUser(rawData)

  if (result.success) {
    await createSession(result.user.id, result.user.role)
  }

  return result
}
