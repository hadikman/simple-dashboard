import {
  type IBrandDocument,
  type TCheckDuplicateBrandResponse,
  type TQueryDuplicateBrandData,
  brandErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function checkDuplicateBrand(
  data: TQueryDuplicateBrandData,
): Promise<TCheckDuplicateBrandResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IBrandDocument>(mongoManager.BRANDS_COLL)

  const { slug } = data

  const existingSlugBrand = await collection.findOne({ slug })

  if (existingSlugBrand) {
    return {
      isDuplicate: true,
      message: {
        general: brandErrors['DUPLICATE_SLUG'].server,
        code: 'DUPLICATE_SLUG',
      },
    }
  }

  return {
    isDuplicate: false,
    message: null,
  }
}
