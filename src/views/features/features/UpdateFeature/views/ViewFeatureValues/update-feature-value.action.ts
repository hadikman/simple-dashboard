'use server'

import { updateTag } from 'next/cache'

import { type TFeatureValueData } from '../../../../shared'

import { updateFeatureValue } from './update-feature-value.db'

export async function updateFeatureValueAction(formData: FormData) {
  const rawData: TFeatureValueData = {
    featureId: formData.get('featureId') as string,
    value: {
      id: Number(formData.get('id') as string),
      value: formData.get('value') as string,
    },
  }

  const result = await updateFeatureValue(rawData)

  if (result.success) {
    updateTag('feature-' + result.feature.featureId)
    updateTag('features-list')

    for (let i = 0; i < result.productsId.length; i++) {
      const { id } = result.productsId[i]
      updateTag('product-' + id)
    }

    for (let i = 0; i < result.productsDraftId.length; i++) {
      const { id } = result.productsDraftId[i]
      updateTag('product-draft-' + id)
    }
  }

  return result
}
