import { ObjectId } from 'mongodb'

import {
  type IFeatureDocument,
  type TUpdateFeatureData,
  type TUpdateFeatureResponse,
  featureErrors,
} from '../../../../shared'

import { mongoManager } from '@/config/db/MongoManager'
import { getCurrentUTCDate, isString } from '@/helpers/utils'

export async function updateFeature(
  updateFeatureData: TUpdateFeatureData,
): Promise<TUpdateFeatureResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IFeatureDocument>(mongoManager.FEATURES_COLL)
  const { id, applicable_category_id, ...rest } = updateFeatureData

  const objectId = new ObjectId(id)
  const applicableCategoryObjectIdOrUndefined = isString(applicable_category_id)
    ? applicable_category_id.length
      ? new ObjectId(applicable_category_id)
      : null
    : undefined

  const updateProductDoc = {
    ...rest,

    ...(passIfNotUndefined(applicableCategoryObjectIdOrUndefined) && {
      applicable_category_id: applicableCategoryObjectIdOrUndefined,
    }),

    updated_at: getCurrentUTCDate(),
  }

  const data = await collection.findOneAndUpdate(
    { _id: objectId },
    { $set: updateProductDoc },
    { returnDocument: 'after' },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: featureErrors['UPDATE_FAILURE'].server,
        code: 'UPDATE_FAILURE',
      },
    }
  }

  return {
    success: true,
    feature: { id, slug: rest.slug || '' },
  }
}

function passIfNotUndefined<T>(value: T): boolean {
  return value !== undefined
}
