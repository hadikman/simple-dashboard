import { ObjectId } from 'mongodb'

import {
  type ICategoryDocument,
  type TDeleteCategoryData,
  type TDeleteCategoryResponse,
  categoryErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function deleteCategory(
  deleteCategoryData: TDeleteCategoryData,
): Promise<TDeleteCategoryResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const { category_group, parentId, id, name, childrenId } = deleteCategoryData

  const collection = db.collection<ICategoryDocument>(
    mongoManager.CATEGORY_COLL,
  )
  let featuresColl

  if (category_group === 'products') {
    featuresColl = db.collection<{ applicable_category_id: ObjectId | null }>(
      mongoManager.FEATURES_COLL,
    )
  }

  const objectId = new ObjectId(id)

  const data = await collection.deleteOne({ category_group, _id: objectId })

  if (!data) {
    return {
      success: false,
      errors: {
        general: categoryErrors['DELETE_FAILURE'].server,
        code: 'DELETE_FAILURE',
      },
    }
  }

  if (parentId) {
    const parentObjectId = new ObjectId(parentId)
    await collection.updateOne(
      { category_group, _id: parentObjectId },
      { $pull: { children: name } },
    )
  }

  if (childrenId && childrenId?.length > 0) {
    const childrenObjectId = childrenId.map(childId => new ObjectId(childId))
    await collection.deleteMany({
      category_group,
      _id: { $in: childrenObjectId },
    })
  }

  // Delete category from features
  if (category_group === 'products' && featuresColl) {
    await featuresColl.updateMany(
      { applicable_category_id: objectId },
      { $set: { applicable_category_id: null } },
    )
  }

  return {
    success: true,
    deleteCount: data.deletedCount,
    category: { name },
  }
}
