import {
  type IOfferDocument,
  type TCheckDuplicateOfferResponse,
  type TQueryDuplicateGuaranteePropData,
  offerErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function checkDuplicateOffer(
  queryDuplicateGuaranteePropData: TQueryDuplicateGuaranteePropData,
): Promise<TCheckDuplicateOfferResponse> {
  const collection = await mongoManager.getCollection<IOfferDocument>(
    COLLECTIONS.OFFERS,
  )

  const { key, value } = queryDuplicateGuaranteePropData

  const existingOffer = await collection.findOne({ [key]: value })

  if (existingOffer) {
    return {
      isDuplicate: true,
      message: {
        general: offerErrors['DUPLICATE_PROP'].server,
        code: 'DUPLICATE_PROP',
      },
    }
  }

  return {
    isDuplicate: false,
    message: null,
  }
}
