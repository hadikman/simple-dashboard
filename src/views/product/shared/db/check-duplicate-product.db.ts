import {
  type IProductDocument,
  type TCheckDuplicateProductResponse,
  type TQueryDuplicateProductData,
  productErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'
import { getPublishedSlugCached } from './published-slug-cache'

export async function checkDuplicateProduct(
  checkDuplicateFeatureData: TQueryDuplicateProductData,
): Promise<TCheckDuplicateProductResponse> {
  const collection = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )
  const { slug, productGroupId } = checkDuplicateFeatureData
  let existingSlugProduct = null,
    publishedSlug = null

  // Allow draft products to reuse the slug from their published version
  if (productGroupId) {
    ;[existingSlugProduct, publishedSlug] = await Promise.all([
      collection.findOne({ slug }, { projection: { _id: 1 } }),
      getPublishedSlugCached(collection, productGroupId),
    ])
  } else {
    existingSlugProduct = await collection.findOne(
      { slug },
      { projection: { _id: 1 } },
    )
  }

  const isSameWithPublishedSlug = publishedSlug === slug

  if (existingSlugProduct && !isSameWithPublishedSlug) {
    return {
      isDuplicate: true,
      message: {
        general: productErrors['DUPLICATE_SLUG'].server,
        code: 'DUPLICATE_SLUG',
      },
    }
  }

  return {
    isDuplicate: false,
    message: null,
  }
}
