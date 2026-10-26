import { ObjectId } from 'mongodb'

import {
  type ICategoryDocument,
  type TUpdateCategoryData,
  type TUpdateCategoryResponse,
  categoryErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function updateCategory(
  updateCategoryData: TUpdateCategoryData,
): Promise<TUpdateCategoryResponse> {
  const { category_group, id, name, newName, parentId } = updateCategoryData
  const collection = await mongoManager.getCollection<ICategoryDocument>(
    COLLECTIONS.CATEGORY,
  )

  const objectId = new ObjectId(id)

  const data = await collection.updateOne(
    { category_group, _id: objectId },
    { $set: { name: newName } },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: categoryErrors['UPDATE_FAILURE'].server,
        code: 'UPDATE_FAILURE',
      },
    }
  }

  if (parentId) {
    const objectId = new ObjectId(parentId)
    await collection.updateOne(
      { category_group, _id: objectId, children: name },
      { $set: { 'children.$': newName } },
    )
  }

  return {
    success: true,
    category: { name },
  }
}
