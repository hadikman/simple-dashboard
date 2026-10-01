'use server'

import { cacheTag } from 'next/cache'

import { type TQueryCategoriesData } from '../'

import { getCategories } from '../db/get-categories.db'

export async function queryCategories(data: TQueryCategoriesData) {
  'use cache'

  const result = await getCategories(data)

  if (result.success) {
    cacheTag(`${data.category_group}-categories-list`)
  }

  return result
}
