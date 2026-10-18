'use server'

import { type TQueryDuplicateGuaranteePropData } from '../'

import { checkDuplicateOffer } from '../db/check-duplicate-offer.db'

export async function queryDuplicateOffer(
  data: TQueryDuplicateGuaranteePropData,
) {
  return await checkDuplicateOffer(data)
}
