'use server'

import { cacheTag } from 'next/cache'

import { getGuarantees } from '../db/get-guarantees.db'

export async function queryGuarantees() {
  'use cache'

  const result = await getGuarantees()

  if (result.success) {
    cacheTag('guarantees-list')
  }

  return result
}
