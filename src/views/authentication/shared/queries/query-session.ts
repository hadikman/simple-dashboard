'use server'

import { verifySession } from '../server'

export async function querySession() {
  return await verifySession()
}
