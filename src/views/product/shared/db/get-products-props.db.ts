import { ObjectId } from 'mongodb'

import type { WithId } from '@/helpers/ts-utils'

import {
  type IProductDocument,
  type TGetProductsPropsResponse,
  type TQueryProductsPropsData,
  productErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getProductsProps<
  T extends Partial<Record<keyof IProductDocument, unknown>>,
>(
  getProductsPropsData: TQueryProductsPropsData<T>,
): Promise<TGetProductsPropsResponse<T>> {
  const { keys, type } = getProductsPropsData
  const isDraftMode = type === 'draft'
  const selectedColl = isDraftMode
    ? COLLECTIONS.PRODUCTS_DRAFT
    : COLLECTIONS.PRODUCTS
  const collection =
    await mongoManager.getCollection<IProductDocument>(selectedColl)

  const cursor = collection.find()
  const projectCursor = cursor.project<T & { _id: ObjectId }>(keys)
  const data = await projectCursor.toArray()

  if (data.length === 0) {
    return {
      success: false,
      errors: {
        general: productErrors['NOT_FOUND_PRODUCTS_PROPS'].server,
        code: 'NOT_FOUND_PRODUCTS_PROPS',
      },
    }
  }

  const dataWithId = data.map(({ _id, ...rest }) => ({
    ...rest,
    id: _id.toHexString(),
  })) as unknown as WithId<T>[]

  return {
    success: true,
    products: dataWithId,
  }
}
