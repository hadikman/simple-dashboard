import { ObjectId } from 'mongodb'

import {
  type IBrandDocument,
  type TUpdateBrandData,
  type TUpdateBrandResponse,
  brandErrors,
} from '../../shared'

import { mongoManager } from '@/config/db/MongoManager'
import { getCurrentUTCDate } from '@/helpers/utils'

export async function updateBrand(
  updateProductData: TUpdateBrandData,
): Promise<TUpdateBrandResponse> {
  const { id, categories, ...rest } = updateProductData

  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IBrandDocument>(mongoManager.BRANDS_COLL)

  const objectId = new ObjectId(id)
  const categoriesObjectIdOrUndefined = categories
    ? categories.length
      ? categories.map(id => new ObjectId(id))
      : []
    : undefined

  // For unchanged props, used undefined to ignore them, for changed props with cleared value, used null
  const updateProductDoc = {
    ...rest,

    ...(passIfNotUndefined(categoriesObjectIdOrUndefined) && {
      categories: categoriesObjectIdOrUndefined,
    }),

    updated_at: getCurrentUTCDate(),
  }

  const mongoUpdateData: Record<string, unknown> = {}

  function generateMongoUpdateObjByRecursive(data: object, parentKey?: string) {
    Object.entries(data).forEach(([key, value]) => {
      const finalKey = parentKey ? `${parentKey}.${key}` : key

      if (value === null) {
        mongoUpdateData[finalKey] = value
        return
      }

      if (value instanceof ObjectId) {
        return (mongoUpdateData[finalKey] = value)
      }

      if (value instanceof Date) {
        mongoUpdateData[finalKey] = value
        return
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        generateMongoUpdateObjByRecursive(value, finalKey)
        return
      }

      if (parentKey) {
        mongoUpdateData[finalKey] = value
        return
      }

      mongoUpdateData[finalKey] = value
    })
  }

  generateMongoUpdateObjByRecursive(updateProductDoc)

  const data = await collection.findOneAndUpdate(
    { _id: objectId },
    { $set: mongoUpdateData },
    { returnDocument: 'after' },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: brandErrors['UPDATE_FAILURE'].server,
        code: 'UPDATE_FAILURE',
      },
    }
  }

  return {
    success: true,
    brand: { id, slug: rest.slug || '' },
  }
}

function passIfNotUndefined<T>(value: T): boolean {
  return value !== undefined
}
