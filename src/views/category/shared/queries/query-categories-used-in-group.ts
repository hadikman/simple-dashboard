'use server'

import { type TQueryCategoriesUsedInGroupData } from '../'

import { checkCategoriesUsedInGroup } from '../db/check-categories-used-in-group.db'

export async function queryCategoriesUsedInGroup(
  data: TQueryCategoriesUsedInGroupData,
) {
  return await checkCategoriesUsedInGroup(data)
}
