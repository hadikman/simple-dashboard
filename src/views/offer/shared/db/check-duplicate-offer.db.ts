import {
  type IOfferDocument,
  type TCheckDuplicateOfferResponse,
  type TQueryDuplicateGuaranteePropData,
  offerErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function checkDuplicateOffer(
  queryDuplicateGuaranteePropData: TQueryDuplicateGuaranteePropData,
): Promise<TCheckDuplicateOfferResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IOfferDocument>(mongoManager.OFFERS_COLL)

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
