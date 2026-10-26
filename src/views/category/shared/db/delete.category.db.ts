import { ObjectId } from 'mongodb'

import {
  type ICategoryDocument,
  type TDeleteCategoryData,
  type TDeleteCategoryResponse,
  categoryErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function deleteCategory(
  deleteCategoryData: TDeleteCategoryData,
): Promise<TDeleteCategoryResponse> {
  const { category_group, parentId, id, name, childrenId } = deleteCategoryData

  const collection = await mongoManager.getCollection<ICategoryDocument>(
    COLLECTIONS.CATEGORY,
  )
  let featuresColl

  if (category_group === 'products') {
    featuresColl = await mongoManager.getCollection<{
      applicable_category_id: ObjectId | null
    }>(COLLECTIONS.FEATURES)
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
