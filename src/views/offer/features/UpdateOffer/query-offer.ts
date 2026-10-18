'use server'

import { cacheTag } from 'next/cache'

import { type TGetOfferData } from '../../shared'

import { getOffer } from './get-offer.db'

export async function queryOffer(data: TGetOfferData) {
  'use cache'

  const result = await getOffer(data)

  if (result.success) {
    cacheTag('offer-' + result.offer.id)
  }

  return result
}
