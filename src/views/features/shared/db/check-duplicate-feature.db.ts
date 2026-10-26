import {
  type IFeatureDocument,
  type TCheckDuplicateFeatureResponse,
  type TQueryDuplicateFeaturePropData,
  featureErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function checkDuplicateFeature(
  queryDuplicateFeaturePropData: TQueryDuplicateFeaturePropData,
): Promise<TCheckDuplicateFeatureResponse> {
  const collection = await mongoManager.getCollection<IFeatureDocument>(
    COLLECTIONS.FEATURES,
  )

  const { key, value } = queryDuplicateFeaturePropData

  const existingFeature = await collection.findOne({ [key]: value })

  if (existingFeature) {
    return {
      isDuplicate: true,
      message: {
        general: featureErrors['DUPLICATE_PROP'].server,
        code: 'DUPLICATE_PROP',
      },
    }
  }

  return {
    isDuplicate: false,
    message: null,
  }
}
