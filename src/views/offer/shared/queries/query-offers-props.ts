'use server'

import { cacheTag } from 'next/cache'

import type { ProjectionKeys } from '@/helpers/ts-utils'

import { type IOfferDocument } from '../'

import { getOffersProps } from '../db/query-offers-props.db'

export async function queryOffersProps(keys: ProjectionKeys<IOfferDocument>) {
  'use cache'

  const result = await getOffersProps(keys)

  if (result.success) {
    cacheTag('offers-props')
  }

  return result
}
