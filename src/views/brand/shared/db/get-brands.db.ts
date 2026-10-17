import {
  type IBrandDocument,
  type IBrandLookupDocument,
  type TGetBrandsResponse,
  brandErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function getBrands(): Promise<TGetBrandsResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IBrandDocument>(mongoManager.BRANDS_COLL)

  const lookedupDate = (await collection
    .aggregate([
      { $match: {} },

      {
        $lookup: {
          from: mongoManager.CATEGORY_COLL,
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
      { $sort: { _id: -1 } },
    ])
    .toArray()) as IBrandLookupDocument[]

  if (lookedupDate.length === 0) {
    return {
      success: false,
      errors: {
        general: brandErrors['EMPTY_BRANDS'].server,
        code: 'EMPTY_BRANDS',
      },
    }
  }

  const formattedData = lookedupDate.map(({ _id, categories, ...rest }) => ({
    id: _id.toHexString(),
    categories: categories.length
      ? categories.map(({ _id, name }) => ({ id: _id.toHexString(), name }))
      : [],
    ...rest,
  }))

  return {
    success: true,
    brands: formattedData,
  }
}
