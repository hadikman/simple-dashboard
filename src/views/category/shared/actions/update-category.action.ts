'use server'

import { updateTag } from 'next/cache'

import { type CategoryGroupType, type TUpdateCategoryData } from '../'

import { updateCategory } from '../db/update-category.db'

export async function updateCategoryAction(formData: FormData) {
  const rawData: TUpdateCategoryData = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    newName: formData.get('newName') as string,
    parentId: (formData.get('parentId') as string) ?? '',
    category_group: formData.get('category_group') as CategoryGroupType,
  }

  const result = await updateCategory(rawData)

  if (result.success) {
    updateTag(`${rawData.category_group}-categories-list`)
    updateTag('features-list')
    updateTag('products-draft-list')
    updateTag('products-list')
  }

  return result
}
