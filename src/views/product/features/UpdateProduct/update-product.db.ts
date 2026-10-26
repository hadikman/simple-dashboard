import { ObjectId } from 'mongodb'

import { type IGuaranteeDocument } from '@/views/guarantee'

import {
  type IProductDocument,
  type IProductPrice,
  type TUpdateProductData,
  type TUpdateProductResponse,
  REMOVED_FROM_GUARANTEE,
  productErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'
import { getCurrentUTCDate, isString } from '@/helpers/utils'

export async function updateProduct(
  updateProductData: TUpdateProductData,
): Promise<TUpdateProductResponse> {
  const {
    id,
    product_group_id,
    author_id,
    brand_id,
    categories,
    linked_products,
    features,
    ...rest
  } = updateProductData
  const isPublishedMode = updateProductData.status === 'published'

  const selectedColl = isPublishedMode
    ? COLLECTIONS.PRODUCTS
    : COLLECTIONS.PRODUCTS_DRAFT
  const guaranteeColl = await mongoManager.getCollection<IGuaranteeDocument>(
    COLLECTIONS.GUARANTEES,
  )

  const collection =
    await mongoManager.getCollection<IProductDocument>(selectedColl)

  const userObjectId = new ObjectId(author_id)
  const brandObjectIdOrUndefined = isString(brand_id)
    ? brand_id.length
      ? new ObjectId(brand_id)
      : null
    : undefined

  const categoriesObjectIdOrUndefined = categories
    ? categories.length
      ? categories.map(id => new ObjectId(id))
      : []
    : undefined

  const removedGuaranteePriceIds: string[] = []
  const pricesObjectIdOrUndefined: IProductPrice[] | undefined =
    updateProductData.pricing?.prices ? [] : undefined
  if (updateProductData.pricing?.prices) {
    const ps = updateProductData.pricing.prices
    for (let i = 0; i < ps.length; i++) {
      const { offer_id, guarantee_id, ...rest } = ps[i]

      if (rest.guarantee_name === REMOVED_FROM_GUARANTEE) {
        removedGuaranteePriceIds.push(rest.id)
      } else {
        pricesObjectIdOrUndefined?.push({
          ...rest,
          offer_id: offer_id ? new ObjectId(offer_id) : offer_id,
          guarantee_id: guarantee_id
            ? new ObjectId(guarantee_id)
            : guarantee_id,
        })
      }
    }
  }

  const LPUpsellsObjectIdOrUndefined = linked_products?.upsells
    ? linked_products.upsells.length
      ? linked_products.upsells.map(id => new ObjectId(id))
      : []
    : undefined
  const LPCrossSellsObjectIdOrUndefined = linked_products?.cross_sells
    ? linked_products.cross_sells.length
      ? linked_products.cross_sells.map(id => new ObjectId(id))
      : []
    : undefined
  const LPRelatedObjectIdOrUndefined = linked_products?.related
    ? linked_products.related.length
      ? linked_products.related.map(id => new ObjectId(id))
      : []
    : undefined

  const featuresObjectIdOrUndefined = features
    ? features?.length
      ? features.map(({ feature_id, value_id }) => ({
          feature_id: new ObjectId(feature_id!),
          value_id,
        }))
      : []
    : undefined
  const currentUTCDate = getCurrentUTCDate()

  // For unchanged props, used undefined to ignore them, for changed props with cleared value, used null
  const updateProductDoc = {
    ...rest,

    author_id: userObjectId,

    ...(passIfNotUndefined(brandObjectIdOrUndefined) && {
      brand_id: brandObjectIdOrUndefined,
    }),
    ...(passIfNotUndefined(categoriesObjectIdOrUndefined) && {
      categories: categoriesObjectIdOrUndefined,
    }),

    ...(passIfNotUndefined(pricesObjectIdOrUndefined) && {
      'pricing.prices': pricesObjectIdOrUndefined,
    }),

    ...(passIfNotUndefined(LPUpsellsObjectIdOrUndefined) && {
      'linked_products.upsells': LPUpsellsObjectIdOrUndefined,
    }),
    ...(passIfNotUndefined(LPCrossSellsObjectIdOrUndefined) && {
      'linked_products.cross_sells': LPCrossSellsObjectIdOrUndefined,
    }),
    ...(passIfNotUndefined(LPRelatedObjectIdOrUndefined) && {
      'linked_products.related': LPRelatedObjectIdOrUndefined,
    }),
    ...(passIfNotUndefined(featuresObjectIdOrUndefined) && {
      features: featuresObjectIdOrUndefined,
    }),
    ...(isPublishedMode && {
      published_at: currentUTCDate,
      updated_at: currentUTCDate,
    }),
    ...(!isPublishedMode && {
      updated_at: currentUTCDate,
    }),
  }

  const mongoUpdateData: Record<string, unknown> = {}

  function generateMongoUpdateObjByRecursive(data: object, parentKey?: string) {
    Object.entries(data).forEach(([key, value]) => {
      const finalKey = parentKey ? `${parentKey}.${key}` : key

      if (value === null) {
        mongoUpdateData[finalKey] = value
        return
      }

      if (value instanceof ObjectId) {
        return (mongoUpdateData[finalKey] = value)
      }

      if (value instanceof Date) {
        mongoUpdateData[finalKey] = value
        return
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        generateMongoUpdateObjByRecursive(value, finalKey)
        return
      }

      if (parentKey) {
        mongoUpdateData[finalKey] = value
        return
      }

      mongoUpdateData[finalKey] = value
    })
  }

  generateMongoUpdateObjByRecursive(updateProductDoc)

  const data = await collection.findOneAndUpdate(
    { product_group_id },
    { $set: mongoUpdateData },
    { returnDocument: 'after' },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: productErrors['UPDATE_FAILURE'].server,
        code: 'UPDATE_FAILURE',
      },
    }
  }

  const affectedGuarantees = removedGuaranteePriceIds.length
    ? await guaranteeColl
        .find(
          { 'target_items.price_id': { $in: removedGuaranteePriceIds } },
          { projection: { _id: 1, 'target_items.price_id': 1 } },
        )
        .toArray()
    : []

  const deletedGuaranteeIds: ObjectId[] = []
  const modifiedGuaranteeIds: ObjectId[] = []
  const affectedGuaranteeIds: { id: string }[] = []

  for (let i = 0; i < affectedGuarantees.length; i++) {
    const { _id, target_items } = affectedGuarantees[i]

    // Count how many prices remain after we pull the removed ones
    let remainingCount = 0
    for (let j = 0; j < target_items.length; j++) {
      if (!removedGuaranteePriceIds.includes(target_items[j].price_id)) {
        remainingCount++
      }
    }

    if (remainingCount === 0) {
      deletedGuaranteeIds.push(_id)
    } else {
      modifiedGuaranteeIds.push(_id)
    }

    affectedGuaranteeIds.push({ id: _id.toHexString() })
  }

  if (deletedGuaranteeIds.length > 0) {
    await guaranteeColl.deleteMany({ _id: { $in: deletedGuaranteeIds } })
  }

  if (modifiedGuaranteeIds.length > 0) {
    await guaranteeColl.updateMany(
      { _id: { $in: modifiedGuaranteeIds } },
      {
        $pull: {
          target_items: { price_id: { $in: removedGuaranteePriceIds } },
        },
      },
    )
  }

  return {
    success: true,
    product: { id, slug: rest.slug || '' },
    affectedGuaranteeIds,
  }
}

function passIfNotUndefined<T>(value: T): boolean {
  return value !== undefined
}
