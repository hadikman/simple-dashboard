'use server'

import { type TQueryDuplicateBrandData } from '../'

import { checkDuplicateBrand } from '../db/check-duplicate-brand.db'

export async function queryDuplicateBrand(data: TQueryDuplicateBrandData) {
  return await checkDuplicateBrand(data)
}
