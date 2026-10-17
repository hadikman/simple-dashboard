import { ObjectId } from 'mongodb'

import type { WithId } from '@/helpers/ts-utils'

import {
  type IBrandDocument,
  type TGetBrandsPropsResponse,
  type TQueryBrandsPropsData,
  brandErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function getBrandsProps<
  T extends Partial<Record<keyof IBrandDocument, unknown>>,
>(
  getBrandsPropsData: TQueryBrandsPropsData<T>,
): Promise<TGetBrandsPropsResponse<T>> {
  const db = await mongoManager.getConnectedDatabase()
  const { keys } = getBrandsPropsData

  const collection = db.collection<IBrandDocument>(mongoManager.BRANDS_COLL)

  const cursor = collection.find()
  const projectCursor = cursor.project<T & { _id: ObjectId }>(keys)
  const data = await projectCursor.toArray()

  if (data.length === 0) {
    return {
      success: false,
      errors: {
        general: brandErrors['NOT_FOUND_BRANDS_PROPS'].server,
        code: 'NOT_FOUND_BRANDS_PROPS',
      },
    }
  }

  const dataWithId = data.map(({ _id, ...rest }) => ({
    ...rest,
    id: _id.toHexString(),
  })) as unknown as WithId<T>[]

  return {
    success: true,
    brands: dataWithId,
  }
}
