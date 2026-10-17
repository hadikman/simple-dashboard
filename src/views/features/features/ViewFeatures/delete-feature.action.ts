'use server'

import { updateTag } from 'next/cache'

import { type TDeleteFeatureData } from '../../shared'

import { deleteFeature } from './delete.feature.db'

export async function deleteFeatureAction(
  deleteFeatureData: TDeleteFeatureData,
) {
  const result = await deleteFeature(deleteFeatureData)

  if (result.success) {
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
