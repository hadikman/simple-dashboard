import {
  type IFeatureDocument,
  type TCheckDuplicateFeatureResponse,
  type TQueryDuplicateFeaturePropData,
  featureErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function checkDuplicateFeature(
  queryDuplicateFeaturePropData: TQueryDuplicateFeaturePropData,
): Promise<TCheckDuplicateFeatureResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IFeatureDocument>(mongoManager.FEATURES_COLL)

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
