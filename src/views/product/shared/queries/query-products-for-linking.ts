'use server'

import { cacheTag } from 'next/cache'

import { getProductsForLinking } from '../db/get-products-for-linking.db'

export async function queryProductsForLinking() {
  'use cache'

  const result = await getProductsForLinking()

  if (result.success) {
    cacheTag('products-for-linking-list')
  }

  return result
}
