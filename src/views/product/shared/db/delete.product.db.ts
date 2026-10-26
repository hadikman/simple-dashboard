import {
  type IProductDocument,
  type TDeleteProductData,
  type TDeleteProductResponse,
  productErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function deleteProduct(
  deleteProductData: TDeleteProductData,
): Promise<TDeleteProductResponse> {
  const productsColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )
  const productsDraftColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS_DRAFT,
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
