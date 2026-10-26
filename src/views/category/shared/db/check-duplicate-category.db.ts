import { ObjectId } from 'mongodb'

import {
  type ICategoryDocument,
  type TCheckDuplicateCategoryResponse,
  type TQueryDuplicateCategoryData,
  categoryErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function checkDuplicateCategory(
  checkDuplicateCategoryData: TQueryDuplicateCategoryData,
): Promise<TCheckDuplicateCategoryResponse> {
  const { category_group, parentId, name } = checkDuplicateCategoryData
  const collection = await mongoManager.getCollection<ICategoryDocument>(
    COLLECTIONS.CATEGORY,
  )

  if (parentId) {
    const objectId = new ObjectId(parentId)

    const existingName = await collection.findOne({
      category_group,
      _id: objectId,
      children: name,
    })

    if (existingName) {
      return {
        isDuplicate: true,
        message: {
          general: categoryErrors['DUPLICATE_NAME'].server,
          code: 'DUPLICATE_NAME',
        },
      }
    }
  } else {
    const existingName = await collection
      .find({ category_group, name, children: [] })
      .toArray()

    if (existingName.length > 0) {
      return {
        isDuplicate: true,
        message: {
          general: categoryErrors['DUPLICATE_NAME'].server,
          code: 'DUPLICATE_NAME',
        },
      }
    }
  }

  return {
    isDuplicate: false,
    message: null,
  }
}
