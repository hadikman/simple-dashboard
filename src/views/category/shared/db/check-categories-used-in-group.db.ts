import { ObjectId } from 'mongodb'

import {
  type TCheckCategoriesUsedInGroupResponse,
  type TQueryCategoriesUsedInGroupData,
  categoryErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function checkCategoriesUsedInGroup(
  queryCategoriesUsedInGroupData: TQueryCategoriesUsedInGroupData,
): Promise<TCheckCategoriesUsedInGroupResponse> {
  let collection, drafCollection
  const { category_group, ids } = queryCategoriesUsedInGroupData

  if (category_group === 'posts') {
    collection = await mongoManager.getCollection<{ categories: ObjectId[] }>(
      COLLECTIONS.POSTS,
    )
    drafCollection = await mongoManager.getCollection<{
      categories: ObjectId[]
    }>(COLLECTIONS.POSTS_DRAFT)
  } else {
    collection = await mongoManager.getCollection<{ categories: ObjectId[] }>(
      COLLECTIONS.PRODUCTS,
    )
    drafCollection = await mongoManager.getCollection<{
      categories: ObjectId[]
    }>(COLLECTIONS.PRODUCTS_DRAFT)
  }

  const objectIds = ids.map(id => new ObjectId(id))

  const existingIdsInProducts = await collection.findOne(
    { categories: { $in: objectIds } },
    { projection: { _id: 1 } },
  )
  const existingIdsInProductsDraft = await drafCollection.findOne(
    { categories: { $in: objectIds } },
    { projection: { _id: 1 } },
  )

  if (existingIdsInProducts || existingIdsInProductsDraft) {
    return {
      isDuplicate: true,
      message: {
        general: categoryErrors['CHECK_USAGE_IN'].server,
        code: 'CHECK_USAGE_IN',
      },
    }
  }

  return {
    isDuplicate: false,
    message: null,
  }
}
