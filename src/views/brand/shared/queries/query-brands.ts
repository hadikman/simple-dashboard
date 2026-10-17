'use server'

import { cacheTag } from 'next/cache'

import { getBrands } from '../db/get-brands.db'

export async function queryBrands() {
  'use cache'

  const result = await getBrands()

  if (result.success) {
    cacheTag('brands-list')
  }

  return result
}
