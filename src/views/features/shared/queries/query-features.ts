'use server'

import { cacheTag } from 'next/cache'

import { getFeatures } from '../db/get-features.db'

export async function queryFeatures() {
  'use cache'

  const result = await getFeatures()

  if (result.success) {
    cacheTag('features-list')
  }

  return result
}
