import { ObjectId } from 'mongodb'

import {
  type IFeatureDocument,
  type TAddFeatureValueResponse,
  type TFeatureValueData,
  featureErrors,
} from '../../../../shared'

import { mongoManager } from '@/config/db/MongoManager'

export async function addFeatureValue(
  featureValueData: TFeatureValueData,
): Promise<TAddFeatureValueResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IFeatureDocument>(mongoManager.FEATURES_COLL)
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
