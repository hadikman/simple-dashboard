import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IFeatureDocument,
  type TDeleteFeatureValueData,
  type TDeleteFeatureValueResponse,
  featureErrors,
} from '../../../../shared'

import { mongoManager } from '@/config/db/MongoManager'

type LookedupObjectIds = { _id: ObjectId }
type LookedupIds = { id: string }

export async function deleteFeatureValue(
  deleteFeatureValueData: TDeleteFeatureValueData,
): Promise<TDeleteFeatureValueResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const featuresColl = db.collection<IFeatureDocument>(
    mongoManager.FEATURES_COLL,
  )
  const productsColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_COLL,
  )
  const productsDraftColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_DRAFT_COLL,
  )
  const { featureId, id } = deleteFeatureValueData

  const objectId = new ObjectId(featureId)

  const data = await featuresColl.updateOne(
    { _id: objectId },
    { $pull: { values: { id } } },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: featureErrors['DELETE_VALUE_FAILURE'].server,
        code: 'DELETE_VALUE_FAILURE',
      },
    }
  }

  const productsData = (await productsColl
    .find({ 'features.feature_id': objectId, 'features.value_id': id })
    .project({ _id: 1 })
    .toArray()) as LookedupObjectIds[]
  const productsId: LookedupIds[] = productsData.map(({ _id }) => ({
    id: _id.toHexString(),
  }))

  const productsDraftLookedupData = (await productsDraftColl
    .aggregate([
      {
        $match: { 'features.feature_id': objectId, 'features.value_id': id },
      },
      {
        $lookup: {
          from: mongoManager.PRODUCTS_COLL,
          localField: 'product_group_id',
          foreignField: 'product_group_id',
          pipeline: [{ $project: { _id: 1 } }],
          as: 'data',
        },
      },
      { $unwind: { path: '$data', preserveNullAndEmptyArrays: true } },
    ])
    .toArray()) as LookedupObjectIds[]

  const productsDraftId: LookedupIds[] = productsDraftLookedupData.map(
    ({ _id }) => ({ id: _id.toHexString() }),
  )

  await productsColl.updateMany(
    { 'features.feature_id': objectId },
    { $pull: { features: { value_id: id } } },
  )
  await productsDraftColl.updateMany(
    { 'features.feature_id': objectId },
    { $pull: { features: { value_id: id } } },
  )

  return {
    success: true,
    feature: { featureId, id },
    productsId,
    productsDraftId,
    modifiedCount: data.modifiedCount,
  }
}
