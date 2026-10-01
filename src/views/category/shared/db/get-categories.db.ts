import {
  type ICategoryDocument,
  type TGetCategoriesResponse,
  type TQueryCategoriesData,
  categoryErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function getCategories(
  queryCategoriesData: TQueryCategoriesData,
): Promise<TGetCategoriesResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const { category_group } = queryCategoriesData
  const collection = db.collection<ICategoryDocument>(
    mongoManager.CATEGORY_COLL,
  )

  const data = await collection.find({ category_group }).toArray()

  if (data.length === 0) {
    return {
      success: false,
      errors: {
        general: categoryErrors['EMPTY_CATEGORIES'].server,
        code: 'EMPTY_CATEGORIES',
      },
    }
  }

  const formattedData = data.map(({ _id, ...rest }) => ({
    ...rest,
    id: _id.toString('hex'),
  }))

  return {
    success: true,
    categories: formattedData,
  }
}
