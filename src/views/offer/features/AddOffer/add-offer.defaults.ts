'use client'

import { type OfferSchemaT } from '../../shared'

import { getUTCDateOffset } from '@/helpers/utils'

export function createAddOfferDefaults(): OfferSchemaT {
  return {
    name: '',
    description: null,
    discount: 0,
    offer_start: getUTCDateOffset(1, false),
    offer_end: getUTCDateOffset(2, true),
    status: 'scheduled',
    target_items: [],
  }
}
