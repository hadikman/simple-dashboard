'use server'

import { type TQueryDuplicateProductData } from '../'

import { checkDuplicateProduct } from '../db/check-duplicate-product.db'

export async function queryDuplicateProduct(data: TQueryDuplicateProductData) {
  return await checkDuplicateProduct(data)
}
