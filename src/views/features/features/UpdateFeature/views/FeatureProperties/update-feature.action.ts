'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { type TUpdateFeatureData } from '../../../../shared'

import { updateFeature } from './update-feature.db'
import { parseFormDataByKey } from '@/helpers/utils'

type UpdateFeatureActionProps = {
  formData: FormData
  currentSlug: string
}

export async function updateFeatureAction({
  formData,
  currentSlug,
}: UpdateFeatureActionProps) {
  const rawData: TUpdateFeatureData = {
    id: parseFormDataByKey(formData, 'id'),
    name: parseFormDataByKey(formData, 'name'),
    slug: parseFormDataByKey(formData, 'slug'),
    description: parseFormDataByKey(formData, 'description'),
    type: parseFormDataByKey(formData, 'type'),
    category: parseFormDataByKey(formData, 'category'),
    values: parseFormDataByKey(formData, 'values'),
    is_required: parseFormDataByKey(formData, 'is_required'),
    display_order: parseFormDataByKey(formData, 'display_order'),
    status: parseFormDataByKey(formData, 'status'),
    applicable_category_id: parseFormDataByKey(
      formData,
      'applicable_category_id',
    ),
  }

  const data: TUpdateFeatureData = Object.fromEntries(
    Object.entries(rawData).filter(([_, value]) => value !== null),
  ) as TUpdateFeatureData

  const result = await updateFeature(data)

  if (result.success) {
    // If the slug is updated, don't need to update feature cache, it must shows stale data until fresh data be ready, otherwise the cache need to update to show fresh data immediately
    if (currentSlug === result.feature.slug) {
      updateTag('feature-' + result.feature.id)
    } else {
      revalidatePath('/dashboard/products/features/' + result.feature.slug)
    }

    updateTag('features-props')
    updateTag('features-list')
  }

  return result
}
