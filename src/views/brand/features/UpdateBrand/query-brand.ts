'use server'

import { cacheTag } from 'next/cache'

import { type TQueryBrandData } from '../../shared'

import { getBrand } from './get-brand.db'

export async function queryBrand(data: TQueryBrandData) {
  'use cache'

  const result = await getBrand(data)

  if (result.success) {
    // If the brand slug is changed, this cache shouldn't invalidate, because by invalidation it shows the error "Brand not found" while the page is getting fresh data, so it's better show stale data instead of error while it's getting fresh data.
    cacheTag('brand-' + result.brand.id)
  }

  return result
}
