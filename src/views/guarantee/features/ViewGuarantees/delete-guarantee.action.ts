'use server'

import { updateTag } from 'next/cache'

import { type TDeleteGuaranteeData } from '../../shared'

import { deleteGuarantee } from './delete-guarantee.db'

export async function deleteGuaranteeAction(
  deleteGuaranteeData: TDeleteGuaranteeData,
) {
  const result = await deleteGuarantee(deleteGuaranteeData)

  if (result.success) {
    updateTag('guarantees-list')

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
