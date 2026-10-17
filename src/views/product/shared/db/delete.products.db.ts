import { DeleteResult } from 'mongodb'

import {
  type IProductDocument,
  type TDeleteProductsData,
  type TDeleteProductsResponse,
  productErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function deleteProducts(
  deleteProductData: TDeleteProductsData,
): Promise<TDeleteProductsResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const productsColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_COLL,
  )
  const productsDraftColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_DRAFT_COLL,
  )
  let data: DeleteResult = { acknowledged: false, deletedCount: 0 },
    draftData: DeleteResult = { acknowledged: false, deletedCount: 0 }

  const [products, onlyDrafts, productsForUpdate] = deleteProductData.reduce<
    [TDeleteProductsData, TDeleteProductsData, TDeleteProductsData]
  >(
    (acc, cur) => {
      if (cur.hasDraft && !cur.isPublished) {
        acc[0].push(cur) // Audit (published)
        acc[1].push(cur) //  Audit (draft)
      } else if (cur.onlyDeleteDraft) {
        acc[1].push(cur) // Draft
        acc[2].push(cur) // Add Product to update has_draft
      } else {
        acc[0].push(cur) // Published
      }

      return acc
    },
    [[], [], []],
  )

  if (products.length) {
    const productsGroupIds = products.map(
      ({ productGroupId }) => productGroupId,
    )
    data = await productsColl.deleteMany({
      product_group_id: { $in: productsGroupIds },
    })

    if (!data) {
      return {
        success: false,
        errors: {
          general: productErrors['DELETE_PRODUCTS_FAILURE'].server,
          code: 'DELETE_PRODUCTS_FAILURE',
        },
      }
    }
  }

  if (onlyDrafts.length) {
    const productsGroupIds = onlyDrafts.map(
      ({ productGroupId }) => productGroupId,
    )
    draftData = await productsDraftColl.deleteMany({
      product_group_id: { $in: productsGroupIds },
    })

    if (!draftData) {
      return {
        success: false,
        errors: {
          general: productErrors['DELETE_DRAFTS_FAILURE'].server,
          code: 'DELETE_DRAFTS_FAILURE',
        },
      }
    }
  }

  if (productsForUpdate.length) {
    const productGroupIds = productsForUpdate.map(
      ({ productGroupId }) => productGroupId,
    )
    await productsColl.updateMany(
      { product_group_id: { $in: productGroupIds } },
      { $set: { has_draft: false } },
    )
  }

  const deleteCount = data.deletedCount + draftData.deletedCount

  return {
    success: true,
    deleteCount,
  }
}
