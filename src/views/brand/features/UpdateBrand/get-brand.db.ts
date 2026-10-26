import {
  type IBrandDocument,
  type IBrandLookupDocument,
  type TBrandLookupDataWithId,
  type TGetBrandLookupResponse,
  type TQueryBrandData,
  brandErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getBrand(
  getBrandData: TQueryBrandData,
): Promise<TGetBrandLookupResponse> {
  const { slug } = getBrandData
  const collection = await mongoManager.getCollection<IBrandDocument>(
    COLLECTIONS.BRANDS,
  )

  const lookedupData = await collection
    .aggregate([
      {
        $match: { slug },
      },

      {
        $lookup: {
          from: COLLECTIONS.CATEGORY,
          localField: 'categories',
          foreignField: '_id',
          pipeline: [
            { $match: { category_group: 'products' } },
            { $project: { name: 1 } },
          ],
          as: 'categories_data',
        },
      },
      { $addFields: { categories: '$categories_data' } },
      { $unset: 'categories_data' },

      { $project: { schema_version: 0 } },
    ])
    .next()

  if (!lookedupData) {
    return {
      success: false,
      errors: {
        general: brandErrors['NOT_FOUND_BRAND'].server,
        code: 'NOT_FOUND_BRAND',
      },
    }
  }

  const { _id, categories, ...rest } = lookedupData as IBrandLookupDocument
  const lookedupDataWithId: TBrandLookupDataWithId = {
    id: _id.toHexString(),
    categories: categories.length
      ? categories.map(({ _id, name }) => ({ id: _id.toHexString(), name }))
      : [],
    ...rest,
  }

  return {
    success: true,
    brand: lookedupDataWithId,
  }
}
