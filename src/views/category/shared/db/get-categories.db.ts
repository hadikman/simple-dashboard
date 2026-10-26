import {
  type ICategoryDocument,
  type TGetCategoriesResponse,
  type TQueryCategoriesData,
  categoryErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getCategories(
  queryCategoriesData: TQueryCategoriesData,
): Promise<TGetCategoriesResponse> {
  const { category_group } = queryCategoriesData
  const collection = await mongoManager.getCollection<ICategoryDocument>(
    COLLECTIONS.CATEGORY,
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
