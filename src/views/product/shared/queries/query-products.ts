'use server'

import { cacheTag } from 'next/cache'

import { type TQueryProductsData } from '..'

import { getProducts } from '../db/get-products.db'

export async function queryProducts(data: TQueryProductsData) {
  'use cache'

  const result = await getProducts(data)

  if (result.success) {
    if (data.type === 'draft') {
      cacheTag('products-draft-list')
    } else {
      cacheTag('products-list')
    }
  }

  return result
}
