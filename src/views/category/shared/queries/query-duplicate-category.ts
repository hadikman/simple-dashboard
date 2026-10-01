'use server'

import { type TQueryDuplicateCategoryData } from '../'

import { checkDuplicateCategory } from '../db/check-duplicate-category.db'

export async function queryDuplicateCategory(
  data: TQueryDuplicateCategoryData,
) {
  return await checkDuplicateCategory(data)
}
