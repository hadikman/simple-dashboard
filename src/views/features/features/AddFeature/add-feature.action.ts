'use server'

import { updateTag } from 'next/cache'

import { type TFeatureData } from '../../shared'

import { addFeature } from './add-feature.db'

export async function addFeatureAction(formData: FormData) {
  const rawData: TFeatureData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: '',
    type: '',
    category: '',
    values: [],
    is_required: false,
    display_order: 1,
    status: 'active',
    applicable_category_id:
      (formData.get('applicable_category_id') as string) ?? null,
    applicable_category_name:
      (formData.get('applicable_category_name') as string) ?? '',
  }

  const result = await addFeature(rawData)

  if (result.success) {
    updateTag('features-props')
    updateTag('features-list')
  }

  return result
}
