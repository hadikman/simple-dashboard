import { ObjectId } from 'mongodb'

import {
  type ICategoryDocument,
  type TAddCategoryData,
  type TAddCategoryResponse,
  categoryErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function addCategory(
  categoryData: TAddCategoryData,
): Promise<TAddCategoryResponse> {
  const { category_group, name, parentId } = categoryData
  const collection = await mongoManager.getCollection<ICategoryDocument>(
    COLLECTIONS.CATEGORY,
  )

  let existingCategoryId = null,
    existingCategoryParent = null

  existingCategoryId = await collection.findOne({ category_group, name })

  if (parentId) {
    const objectId = new ObjectId(parentId)

    existingCategoryParent = await collection.findOne({
      category_group,
      _id: objectId,
      children: name,
    })
  }

  const isDuplicateCategoryWithoutParent = existingCategoryId && parentId === ''
  const isDuplicateCategoryWithParent =
    existingCategoryParent && existingCategoryId
  const isDuplicateCategory =
    isDuplicateCategoryWithoutParent || isDuplicateCategoryWithParent

  if (isDuplicateCategory) {
    return {
      success: false,
      errors: {
        general: categoryErrors['CATEGORY_EXISTS'].server,
        code: 'CATEGORY_EXISTS',
      },
    }
  }

  const newCategoryDoc: ICategoryDocument = {
    category_group,
    name,
    children: [],
  }

  const data = await collection.insertOne(newCategoryDoc)
  if (parentId) {
    const objectId = new ObjectId(parentId)

    await collection.updateOne(
      { _id: objectId },
      { $addToSet: { children: name } },
    )
  }

  if (!data) {
    return {
      success: false,
      errors: {
        general: categoryErrors['CREATE_FAILURE'].server,
        code: 'CREATE_FAILURE',
      },
    }
  }

  return {
    success: true,
    category: { id: data.insertedId.toString('hex') },
  }
}
