'use server'

import { updateTag } from 'next/cache'

import { type TDeleteFeatureValueData } from '../../../../shared'

import { deleteFeatureValue } from './delete.feature-value.db'

export async function deleteFeatureValueAction(
  deleteFeatureValueData: TDeleteFeatureValueData,
) {
  const result = await deleteFeatureValue(deleteFeatureValueData)

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
