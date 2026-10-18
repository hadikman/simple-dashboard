'use server'

import { updateTag } from 'next/cache'

import { type TDeleteOfferData } from '../../shared'

import { deleteOffer } from './delete.offer.db'

export async function deleteOfferAction(data: TDeleteOfferData) {
  const result = await deleteOffer(data)

  if (result.success) {
    updateTag('offers-list')

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
