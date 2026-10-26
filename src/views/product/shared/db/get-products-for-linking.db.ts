import { FindCursor } from 'mongodb'

import {
  type ILinkedProductLookup,
  type IProductDocument,
  type TGetProductsForLinkingResponse,
  type TLinkedProductLookupWithId,
  productErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getProductsForLinking(): Promise<TGetProductsForLinkingResponse> {
  const collection = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )

  const cursor = collection.find({ status: 'published' })
  const projectCursor = cursor.sort({ _id: -1 }).project({
    product_group_id: 1,
    title: 1,
  }) as unknown as FindCursor<ILinkedProductLookup>
  const data = await projectCursor.toArray()

  if (data.length === 0) {
    return {
      success: false,
      errors: {
        general: productErrors['EMPTY_PRODUCTS'].server,
        code: 'EMPTY_PRODUCTS',
      },
    }
  }

  const dataWithId = data.map(({ _id, product_group_id, title }) => ({
    id: _id.toHexString(),
    product_group_id,
    title,
  })) as unknown as TLinkedProductLookupWithId[]

  return {
    success: true,
    products: dataWithId,
  }
}
