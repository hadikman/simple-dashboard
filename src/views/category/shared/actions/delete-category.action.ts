'use server'

import { updateTag } from 'next/cache'

import { type TDeleteCategoryData } from '../'

import { deleteCategory } from '../db/delete.category.db'

export async function deleteCategoryAction(data: TDeleteCategoryData) {
  const result = await deleteCategory(data)

  if (result.success) {
    updateTag(`${data.category_group}-categories-list`)
    updateTag('features-list')
  }

  return result
}
