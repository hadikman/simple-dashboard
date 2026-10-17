import {
  type IProductDocument,
  type TUpdateProductPropData,
  type TUpdateProductPropDataResponse,
  productErrors,
} from '../../../shared'

import { mongoManager } from '@/config/db/MongoManager'
import { getCurrentUTCDate } from '@/helpers/utils'

export async function updateProductProp(
  updateProductPropData: TUpdateProductPropData,
): Promise<TUpdateProductPropDataResponse> {
  const { product_group_id, status, updatePropsData } = updateProductPropData
  const isPublishedMode = status === 'published'

  const db = await mongoManager.getConnectedDatabase()
  const selectedColl = isPublishedMode
    ? mongoManager.PRODUCTS_COLL
    : mongoManager.PRODUCTS_DRAFT_COLL
  const collection = db.collection<IProductDocument>(selectedColl)

  const currentUTCDate = getCurrentUTCDate()

  const updateProductDoc = {
    ...updatePropsData,
    ...(isPublishedMode && {
      published_at: currentUTCDate,
      updated_at: currentUTCDate,
    }),
    ...(!isPublishedMode && {
      updated_at: currentUTCDate,
    }),
  }

  const mongoUpdateData: Record<string, unknown> = {}

  function generateMongoUpdateObjByRecursive(data: object, parentKey?: string) {
    Object.entries(data).forEach(([key, value]) => {
      const finalKey = parentKey ? `${parentKey}.${key}` : key

      // STANDBY Standby check
      // if (value === null) {
      //   mongoUpdateData[finalKey] = value
      //   return
      // }

      // STANDBY Standby check
      // STANDBY This check is a pass way for ObjectId props. I couldn't check the value is ObjectId. Fix it.
      // if (key.includes('id')) {
      //   return (mongoUpdateData[finalKey] = value)
      // }

      // STANDBY Standby check
      // if (value instanceof Date) {
      //   mongoUpdateData[finalKey] = value
      //   return
      // }

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
    { product_group_id },
    { $set: mongoUpdateData },
    { returnDocument: 'after' },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: productErrors['UPDATE_PRODUCT_PROP_FAILURE'].server,
        code: 'UPDATE_PRODUCT_PROP_FAILURE',
      },
    }
  }

  const value = Object.values(updatePropsData)
  return {
    success: true,
    value,
  }
}
