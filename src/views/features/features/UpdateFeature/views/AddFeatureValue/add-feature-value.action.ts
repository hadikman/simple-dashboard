'use server'

import { updateTag } from 'next/cache'

import { type TFeatureValueData } from '../../../../shared'

import { addFeatureValue } from './add-feature-value.db'

export async function addFeatureValueAction(formData: FormData) {
  const rawData: TFeatureValueData = {
    featureId: formData.get('featureId') as string,
    value: {
      id: Number(formData.get('id') as string),
      value: formData.get('value') as string,
    },
  }

  const result = await addFeatureValue(rawData)

  if (result.success) {
    updateTag('feature-' + result.feature.featureId)
    updateTag('features-list')
  }

  return result
}
