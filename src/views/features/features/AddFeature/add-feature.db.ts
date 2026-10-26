import { ObjectId } from 'mongodb'

import {
  type IFeatureDocument,
  type TAddFeatureResponse,
  type TFeatureData,
  featureErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'
import { getCurrentUTCDate } from '@/helpers/utils'

export async function addFeature(
  featureData: TFeatureData,
): Promise<TAddFeatureResponse> {
  const collection = await mongoManager.getCollection<IFeatureDocument>(
    COLLECTIONS.FEATURES,
  )

  const { applicable_category_id, ...rest } = featureData

  const existingFeature = await collection.findOne({
    slug: featureData.slug,
  })

  if (existingFeature) {
    return {
      success: false,
      errors: {
        general: featureErrors['FEATURE_EXISTS'].server,
        code: 'FEATURE_EXISTS',
      },
    }
  }

  const applicableCategoryObjectId = applicable_category_id
    ? new ObjectId(applicable_category_id)
    : null

  const newFeatureDoc: IFeatureDocument = {
    schema_version: 1.0,
    ...rest,

    applicable_category_id: applicableCategoryObjectId,

    created_at: getCurrentUTCDate(),
    updated_at: null,
  }

  const data = await collection.insertOne(newFeatureDoc)

  if (!data) {
    return {
      success: false,
      errors: {
        general: featureErrors['CREATE_FAILURE'].server,
        code: 'CREATE_FAILURE',
      },
    }
  }

  return {
    success: true,
    feature: { id: data.insertedId.toHexString() },
  }
}
