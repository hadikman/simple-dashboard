import {
  type IProductDocument,
  type TDeleteProductData,
  type TDeleteProductResponse,
  productErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function deleteProduct(
  deleteProductData: TDeleteProductData,
): Promise<TDeleteProductResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const productsColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_COLL,
  )
  const productsDraftColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_DRAFT_COLL,
  )
  const { id, productGroupId, title, hasDraft, onlyDeleteDraft } =
    deleteProductData

  if (hasDraft) {
    const data = await productsDraftColl.deleteOne({
      product_group_id: productGroupId,
    })

    if (!data) {
      return {
        success: false,
        errors: {
          general: productErrors['DELETE_DRAFT_FAILURE'].server,
          code: 'DELETE_DRAFT_FAILURE',
        },
      }
    }
  }

  if (onlyDeleteDraft) {
    return {
      success: true,
      product: { id, title },
    }
  }

  const data = await productsColl.deleteOne({
    product_group_id: productGroupId,
  })

  if (!data) {
    return {
      success: false,
      errors: {
        general: productErrors['DELETE_FAILURE'].server,
        code: 'DELETE_FAILURE',
      },
    }
  }

  return {
    success: true,
    product: { id, title },
  }
}
