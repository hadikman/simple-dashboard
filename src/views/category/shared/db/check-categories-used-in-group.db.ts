import { ObjectId } from 'mongodb'

import {
  type TCheckCategoriesUsedInGroupResponse,
  type TQueryCategoriesUsedInGroupData,
  categoryErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function checkCategoriesUsedInGroup(
  queryCategoriesUsedInGroupData: TQueryCategoriesUsedInGroupData,
): Promise<TCheckCategoriesUsedInGroupResponse> {
  const db = await mongoManager.getConnectedDatabase()
  let collection, drafCollection
  const { category_group, ids } = queryCategoriesUsedInGroupData

  if (category_group === 'posts') {
    collection = db.collection<{ categories: ObjectId[] }>(
      mongoManager.POSTS_COLL,
    )
    drafCollection = db.collection<{ categories: ObjectId[] }>(
      mongoManager.POSTS_DRAFT_COLL,
    )
  } else {
    collection = db.collection<{ categories: ObjectId[] }>(
      mongoManager.PRODUCTS_COLL,
    )
    drafCollection = db.collection<{ categories: ObjectId[] }>(
      mongoManager.PRODUCTS_DRAFT_COLL,
    )
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
