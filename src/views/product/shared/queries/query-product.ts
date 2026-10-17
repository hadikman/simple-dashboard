'use server'

import { cacheTag } from 'next/cache'

import { type TQueryProductData } from '../'

import { getProduct } from '../db/get-product.db'

export async function queryProduct(data: TQueryProductData) {
  'use cache'

  const result = await getProduct(data)

  if (result.success) {
    // If the product slug is changed, these caches shouldn't invalidate, because by invalidation it shows the error "Product not found" while the page is getting fresh data, so it's better show stale data instead of error while it's getting fresh data.
    if (data.type === 'draft') {
      cacheTag('product-draft-' + result.product.id)
    } else {
      cacheTag('product-' + result.product.id)
    }
  }

  return result
}
