'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { type TUpdateOfferData } from '../../shared'

import { parseFormDataByKey } from '@/helpers/utils'
import { updateOffer } from './update-offer.db'

type UpdateOfferActionProps = {
  formData: FormData
  currentSlug: string
}

export async function updateOfferAction({
  formData,
  currentSlug,
}: UpdateOfferActionProps) {
  const offerStart = parseFormDataByKey(
    formData,
    'offer_start',
  ) as TUpdateOfferData['offer_start']
  const offerEnd = parseFormDataByKey(
    formData,
    'offer_end',
  ) as TUpdateOfferData['offer_end']

  const rawData: TUpdateOfferData = {
    id: parseFormDataByKey(formData, 'id'),
    name: parseFormDataByKey(formData, 'name'),
    slug: parseFormDataByKey(formData, 'slug'),
    description: parseFormDataByKey(formData, 'description'),
    discount: parseFormDataByKey(formData, 'discount'),
    offer_start: offerStart ? new Date(offerStart) : offerStart,
    offer_end: offerEnd ? new Date(offerEnd) : offerEnd,
    status: parseFormDataByKey(formData, 'status'),
    target_items: parseFormDataByKey(formData, 'target_items'),
  }

  const data: TUpdateOfferData = Object.fromEntries(
    Object.entries(rawData).filter(([_, value]) => value !== null),
  ) as TUpdateOfferData

  const result = await updateOffer(data)

  if (result.success) {
    // If the slug is updated, don't need to update offer cache, it must shows stale data until fresh data be ready, otherwise the cache need to update to show fresh data immediately
    if (currentSlug === result.offer.slug) {
      updateTag('offer-' + result.offer.id)
    } else {
      revalidatePath('/dashboard/products/offers/' + result.offer.slug)
    }

    updateTag('offers-props')
    updateTag('offers-list')

    for (let i = 0; i < result.productsId.length; i++) {
      const { id } = result.productsId[i]
      updateTag('product-' + id)
    }
  }

  return result
}
