import {
  type IFeatureDocument,
  type IFeatureLookupDocument,
  type TFeatureLookupDataWithId,
  type TGetFeaturesResponse,
  featureErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getFeatures(): Promise<TGetFeaturesResponse> {
  const collection = await mongoManager.getCollection<IFeatureDocument>(
    COLLECTIONS.FEATURES,
  )

  const lookedupData = (await collection
    .aggregate([
      { $match: {} },

      {
        $lookup: {
          from: COLLECTIONS.CATEGORY,
          localField: 'applicable_category_id',
          foreignField: '_id',
          pipeline: [
            { $match: { category_group: 'products' } },
            { $project: { _id: 0, name: 1 } },
          ],
          as: 'applicable_category_data',
        },
      },
      {
        $unwind: {
          path: '$applicable_category_data',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          applicable_category_name: {
            $ifNull: ['$applicable_category_data.name', ''],
          },
        },
      },
      { $unset: 'applicable_category_data' },

      { $project: { schema_version: 0 } },
      { $sort: { _id: -1 } },
    ])
    .toArray()) as IFeatureLookupDocument[]

  if (lookedupData.length === 0) {
    return {
      success: false,
      errors: {
        general: featureErrors['EMPTY_FEATURES'].server,
        code: 'EMPTY_FEATURES',
      },
    }
  }

  const lookedupDataWithId: TFeatureLookupDataWithId[] = lookedupData.map(
    ({ _id, applicable_category_id, ...rest }) => ({
      ...rest,
      id: _id.toHexString(),
      applicable_category_id: applicable_category_id
        ? applicable_category_id.toHexString()
        : null,
    }),
  )

  return {
    success: true,
    features: lookedupDataWithId,
  }
}
