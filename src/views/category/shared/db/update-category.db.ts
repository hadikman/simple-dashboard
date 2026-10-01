import { ObjectId } from 'mongodb'

import {
  type ICategoryDocument,
  type TUpdateCategoryData,
  type TUpdateCategoryResponse,
  categoryErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function updateCategory(
  updateCategoryData: TUpdateCategoryData,
): Promise<TUpdateCategoryResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const { category_group, id, name, newName, parentId } = updateCategoryData
  const collection = db.collection<ICategoryDocument>(
    mongoManager.CATEGORY_COLL,
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
