import {
  type IFeatureDocument,
  type IFeatureLookupDocument,
  type TGetFeatureLookupResponse,
  type TQueryFeatureData,
  featureErrors,
} from '../../shared'

import { mongoManager } from '@/config/db/MongoManager'

export async function getFeature(
  getFeatureData: TQueryFeatureData,
): Promise<TGetFeatureLookupResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IFeatureDocument>(mongoManager.FEATURES_COLL)
  const { slug } = getFeatureData

  const lookedupData = await collection
    .aggregate([
      { $match: { slug } },

      {
        $lookup: {
          from: mongoManager.CATEGORY_COLL,
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

      { $project: { schema_version: 0, created_at: 0, updated_at: 0 } },
    ])
    .next()

  if (!lookedupData) {
    return {
      success: false,
      errors: {
        general: featureErrors['NOT_FOUND_FEATURE'].server,
        code: 'NOT_FOUND_FEATURE',
      },
    }
  }

  const { _id, applicable_category_id, ...rest } =
    lookedupData as IFeatureLookupDocument
  const formattedData = {
    id: _id.toHexString(),
    applicable_category_id: applicable_category_id?.toHexString() || null,
    ...rest,
  }

  return {
    success: true,
    feature: formattedData,
  }
}
