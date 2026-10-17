import { ObjectId } from 'mongodb'

import {
  type IProductDocument,
  type TAddProductResponse,
  type TProductData,
  productErrors,
} from '../../shared'

import { mongoManager } from '@/config/db/MongoManager'
import { getCurrentUTCDate } from '@/helpers/utils'

export async function addProduct(
  productData: TProductData,
): Promise<TAddProductResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const productsColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_COLL,
  )
  const productsDraftColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_DRAFT_COLL,
  )

  const {
    author_id,
    brand_id,
    categories,
    has_draft,
    linked_products,
    features,
  } = productData

  const productGroupId = crypto.randomUUID().split('-')[0]
  const authorObjectId = new ObjectId(author_id)
  const brandObjectIdOrNull = brand_id ? new ObjectId(brand_id) : null
  const categoriesObjectIdOrEmptyArr = categories.length
    ? categories.map(id => new ObjectId(id))
    : []
  const linkedProductsObjectIdOrEmptyArr: Record<
    keyof typeof linked_products,
    ObjectId[]
  > = {
    upsells: linked_products.upsells.map(id => new ObjectId(id)) ?? [],
    cross_sells: linked_products.cross_sells.map(id => new ObjectId(id)) ?? [],
    related: linked_products.related.map(id => new ObjectId(id)) ?? [],
  }
  const featuresObjectIdOrEmptyArr = features.length
    ? features.map(({ feature_id, value_id }) => ({
        feature_id: new ObjectId(feature_id!),
        value_id,
      }))
    : []
  const currentUTCDate = getCurrentUTCDate()

  const newProductDoc: IProductDocument = {
    ...productData,
    schema_version: 1.0,

    product_group_id: productGroupId,

    author_id: authorObjectId,
    brand_id: brandObjectIdOrNull,
    categories: categoriesObjectIdOrEmptyArr,
    linked_products: linkedProductsObjectIdOrEmptyArr,
    features: featuresObjectIdOrEmptyArr,
    published_at: productData.is_published ? currentUTCDate : null,
    created_at: currentUTCDate,
    updated_at: null,
  }

  if (has_draft) {
    const data = await productsDraftColl.insertOne(newProductDoc)

    if (!data) {
      return {
        success: false,
        errors: {
          general: productErrors['FAILURE_DRAFT'].server,
          code: 'FAILURE_DRAFT',
        },
      }
    }
  }

  const data = await productsColl.insertOne(newProductDoc)

  if (!data) {
    return {
      success: false,
      errors: {
        general: productErrors['FAILURE'].server,
        code: 'FAILURE',
      },
    }
  }

  return {
    success: true,
    product: {
      id: data.insertedId.toHexString(),
      product_group_id: productGroupId,
    },
  }
}
