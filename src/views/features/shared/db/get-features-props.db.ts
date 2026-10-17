import { ObjectId } from 'mongodb'

import type { ProjectionKeys, WithId } from '@/helpers/ts-utils'

import {
  type IFeatureDocument,
  type TGetFeaturesPropsResponse,
  featureErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function getFeaturesProps<
  T extends Partial<Record<keyof IFeatureDocument, unknown>>,
>(keys: ProjectionKeys<T>): Promise<TGetFeaturesPropsResponse<T>> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IFeatureDocument>(mongoManager.FEATURES_COLL)

  const cursor = collection.find()
  const projectCursor = cursor.project<T & { _id: ObjectId }>(keys)
  const data = await projectCursor.toArray()

  if (data.length === 0) {
    return {
      success: false,
      errors: {
        general: featureErrors['NOT_FOUND_FEATURES_PROPS'].server,
        code: 'NOT_FOUND_FEATURES_PROPS',
      },
    }
  }

  const formattedData = data.map(({ _id, ...rest }) => ({
    ...rest,
    id: _id.toHexString(),
  })) as unknown as WithId<T>[]

  return {
    success: true,
    features: formattedData,
  }
}
