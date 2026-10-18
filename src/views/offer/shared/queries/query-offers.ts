'use server'

import { cacheTag } from 'next/cache'

import { getOffers } from '../db/query-offers.db'

export async function queryOffers() {
  'use cache'

  const result = await getOffers()

  if (result.success) {
    cacheTag('offers-list')
  }

  return result
}
