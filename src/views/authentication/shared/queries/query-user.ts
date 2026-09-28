'use server'

import { getUser } from '../db/get-user.db'

export async function queryUser(userId: string) {
  return await getUser({ id: userId })
}
