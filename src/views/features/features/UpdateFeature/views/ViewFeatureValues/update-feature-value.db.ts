import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IFeatureDocument,
  type TUpdateFeatureValueData,
  type TUpdateFeatureValueResponse,
  featureErrors,
} from '../../../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

type LookedupObjectIds = { _id: ObjectId }
type LookedupIds = { id: string }

export async function updateFeatureValue(
  updateFeatureValueData: TUpdateFeatureValueData,
): Promise<TUpdateFeatureValueResponse> {
  const featuresColl = await mongoManager.getCollection<IFeatureDocument>(
    COLLECTIONS.FEATURES,
  )
  const productsColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )
  const productsDraftColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS_DRAFT,
  )
  const { featureId, value: featureValue } = updateFeatureValueData
  const { id, value } = featureValue

  const objectId = new ObjectId(featureId)

  const existingFeatureValue = await featuresColl.findOne({
    _id: objectId,
    'values.value': value,
  })

  if (existingFeatureValue) {
    return {
      success: false,
      errors: {
        general: featureErrors['VALUE_EXISTS'].server,
        code: 'VALUE_EXISTS',
      },
    }
  }

  const data = await featuresColl.updateOne(
    { _id: objectId, 'values.id': id },
    { $set: { 'values.$.value': value } },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: featureErrors['UPDATE_VALUE_FAILURE'].server,
        code: 'UPDATE_VALUE_FAILURE',
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

  return {
    success: true,
    feature: { featureId, id },
    productsId,
    productsDraftId,
    modifiedCount: data.modifiedCount,
  }
}
