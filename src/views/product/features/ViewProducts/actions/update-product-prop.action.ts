'use server'

import { revalidateTag, updateTag } from 'next/cache'

import { type TUpdateProductPropData } from '../../../shared'

import { updateProductProp } from '../db/update-product-prop.db'

export async function updateProductPropAction(
  updateProductPropData: TUpdateProductPropData,
) {
  const result = await updateProductProp(updateProductPropData)

  if (result.success) {
    if (updateProductPropData.status === 'draft') {
      updateTag('product-draft-' + updateProductPropData.id)
      revalidateTag('products-draft-list', 'max')
    } else {
      revalidateTag('product-' + updateProductPropData.id, 'max')
      revalidateTag('products-list', 'max')
      revalidateTag('products-for-linking-list', 'max')
    }
  }

  return result
}
