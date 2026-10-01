'use server'

import { updateTag } from 'next/cache'

import { type CategoryGroupType, type TAddCategoryData } from '../'

import { addCategory } from '../db/add-category.db'

export async function addCategoryAction(formData: FormData) {
  const rawData: TAddCategoryData = {
    category_group: formData.get('category_group') as CategoryGroupType,
    name: formData.get('name') as string,
    parentId: (formData.get('parentId') as string) ?? '',
  }

  const result = await addCategory(rawData)

  if (result.success) {
    updateTag(`${rawData.category_group}-categories-list`)
  }

  return result
}
