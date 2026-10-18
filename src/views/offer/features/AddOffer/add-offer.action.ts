'use server'

import { updateTag } from 'next/cache'

import { type TOfferData, type TOfferStatus } from '../../shared'

import { addOffer } from './add-offer.db'

export async function addOfferAction(formData: FormData) {
  const rawData: TOfferData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) ?? '',
    discount: Number(formData.get('discount')) ?? 0,
    offer_start: new Date(formData.get('offer_start') as unknown as Date),
    offer_end: new Date(formData.get('offer_end') as unknown as Date),
    status: formData.get('status') as TOfferStatus,
    target_items: JSON.parse((formData.get('target_items') as string) || '[]'),
  }

  const result = await addOffer(rawData)

  if (result.success) {
    updateTag('offers-props')
    updateTag('offers-list')
  }

  return result
}
