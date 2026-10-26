import { ObjectId } from 'mongodb'

import {
  type IFeatureDocument,
  type TAddFeatureValueResponse,
  type TFeatureValueData,
  featureErrors,
} from '../../../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function addFeatureValue(
  featureValueData: TFeatureValueData,
): Promise<TAddFeatureValueResponse> {
  const collection = await mongoManager.getCollection<IFeatureDocument>(
    COLLECTIONS.FEATURES,
  )
  const { featureId, value } = featureValueData

  const objectId = new ObjectId(featureId)

  const existingFeature = await collection.findOne({
    _id: objectId,
    'values.value': value.value,
  })

  if (existingFeature) {
    return {
      success: false,
      errors: {
        general: featureErrors['VALUE_EXISTS'].server,
        code: 'VALUE_EXISTS',
      },
    }
  }

  const data = await collection.updateOne(
    { _id: objectId },
    { $push: { values: { $each: [value], $position: 0 } } },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: featureErrors['ADD_VALUE_FAILURE'].server,
        code: 'ADD_VALUE_FAILURE',
      },
    }
  }

  return {
    success: true,
    feature: { featureId, id: value.id },
    modifiedCount: data.modifiedCount,
  }
}
