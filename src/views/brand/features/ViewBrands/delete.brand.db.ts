import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IBrandDocument,
  type TDeleteBrandData,
  type TDeleteBrandResponse,
  brandErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function deleteBrand(
  deleteBrandData: TDeleteBrandData,
): Promise<TDeleteBrandResponse> {
  const brandsColl = await mongoManager.getCollection<IBrandDocument>(
    COLLECTIONS.BRANDS,
  )
  const productsColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )
  const productsDraftColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS_DRAFT,
  )

  const { id, name } = deleteBrandData

  const objectId = new ObjectId(id)

  const data = await brandsColl.deleteOne({ _id: objectId })

  if (!data) {
    return {
      success: false,
      errors: {
        general: brandErrors['DELETE_FAILURE'].server,
        code: 'DELETE_FAILURE',
      },
    }
  }

  const { modifiedCount: modifiedProductsCount } =
    await productsColl.updateMany(
      { brand_id: objectId },
      { $set: { brand_id: null, brand_name: '' } },
    )

  const { modifiedCount: modifiedProductsDraftCount } =
    await productsDraftColl.updateMany(
      { brand_id: objectId },
      { $set: { brand_id: null, brand_name: '' } },
    )

  return {
    success: true,
    brand: { id, name },
    modifiedProductsCount,
    modifiedProductsDraftCount,
  }
}
