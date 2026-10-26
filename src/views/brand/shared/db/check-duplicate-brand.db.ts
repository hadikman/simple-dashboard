import {
  type IBrandDocument,
  type TCheckDuplicateBrandResponse,
  type TQueryDuplicateBrandData,
  brandErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function checkDuplicateBrand(
  data: TQueryDuplicateBrandData,
): Promise<TCheckDuplicateBrandResponse> {
  const collection = await mongoManager.getCollection<IBrandDocument>(
    COLLECTIONS.BRANDS,
  )

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
