import {
  type IProductDocument,
  type TDuplicateProductIntoDraftData,
  type TDuplicateProductIntoDraftResponse,
  productErrors,
} from '../../shared'

import { mongoManager } from '@/config/db/MongoManager'

export async function duplicateProductIntoDraft(
  duplicateProductIntoDraftData: TDuplicateProductIntoDraftData,
): Promise<TDuplicateProductIntoDraftResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const productsColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_COLL,
  )
  const productsDraftColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_DRAFT_COLL,
  )

  const { productGroupId } = duplicateProductIntoDraftData

  const productData = await productsColl.findOneAndUpdate(
    { product_group_id: productGroupId },
    { $set: { has_draft: true } },
    { returnDocument: 'after', projection: { _id: 0 } },
  )

  if (!productData) {
    return {
      success: false,
      errors: {
        general: productErrors['NOT_FOUND_PRODUCT_TO_DUPLICATE'].server,
        code: 'NOT_FOUND_PRODUCT_TO_DUPLICATE',
      },
    }
  }

  const productDraftData = await productsDraftColl.insertOne(productData)

  if (!productDraftData) {
    return {
      success: false,
      errors: {
        general: productErrors['DUPLICATE_PRODUCT_INTO_DRAFT_FAILURE'].server,
        code: 'DUPLICATE_PRODUCT_INTO_DRAFT_FAILURE',
      },
    }
  }

  return {
    success: true,
    product: {
      id: productDraftData.insertedId.toHexString(),
      title: productData.title,
      slug: productData.slug,
    },
  }
}
