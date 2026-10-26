import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IFeatureDocument,
  type TDeleteFeatureData,
  type TDeleteFeatureResponse,
  featureErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

type LookedupObjectIds = { _id: ObjectId }
type LookedupIds = { id: string }

export async function deleteFeature(
  deleteFeatureData: TDeleteFeatureData,
): Promise<TDeleteFeatureResponse> {
  const featuresColl = await mongoManager.getCollection<IFeatureDocument>(
    COLLECTIONS.FEATURES,
  )
  const productsColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )
  const productsDraftColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS_DRAFT,
  )
  const { id, name } = deleteFeatureData

  const objectId = new ObjectId(id)

  const data = await featuresColl.deleteOne({ _id: objectId })

  if (!data) {
    return {
      success: false,
      errors: {
        general: featureErrors['DELETE_FAILURE'].server,
        code: 'DELETE_FAILURE',
      },
    }
  }

  const productsData = (await productsColl
    .find({ 'features.feature_id': objectId })
    .project({ _id: 1 })
    .toArray()) as LookedupObjectIds[]
  const productsId: LookedupIds[] = productsData.map(({ _id }) => ({
    id: _id.toHexString(),
  }))

  const productsDraftLookedupData = (await productsDraftColl
    .aggregate([
      {
        $match: { 'features.feature_id': objectId },
      },
      {
        $lookup: {
          from: COLLECTIONS.PRODUCTS,
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
    { $pull: { features: { feature_id: objectId } } },
  )
  await productsDraftColl.updateMany(
    { 'features.feature_id': objectId },
    { $pull: { features: { feature_id: objectId } } },
  )

  return {
    success: true,
    feature: { name },
    productsId,
    productsDraftId,
  }
}
