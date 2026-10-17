import {
  type IProductDocument,
  type IProductLookupDocument,
  type TGetProductsResponse,
  type TProductLookupDataWithId,
  type TQueryProductsData,
  productErrors,
} from '..'

import { mongoManager } from '@/config/db/MongoManager'

export async function getProducts(
  getProductsData: TQueryProductsData,
): Promise<TGetProductsResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const { type } = getProductsData
  const isDraftMode = type === 'draft'
  const selectedColl = isDraftMode
    ? mongoManager.PRODUCTS_DRAFT_COLL
    : mongoManager.PRODUCTS_COLL
  const collection = db.collection<IProductDocument>(selectedColl)

  const lookedupData = (await collection
    .aggregate([
      { $match: {} },
      {
        $lookup: {
          from: mongoManager.USERS_COLL,
          localField: 'author_id',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 0, username: 1 } }],
          as: 'author_data',
        },
      },
      {
        $unwind: {
          path: '$author_data',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          author_name: { $ifNull: ['$author_data.username', ''] },
        },
      },
      { $unset: 'author_data' },

      {
        $lookup: {
          from: mongoManager.BRANDS_COLL,
          localField: 'brand_id',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: 'brand_data',
        },
      },
      { $unwind: { path: '$brand_data', preserveNullAndEmptyArrays: true } },
      { $addFields: { brand_name: { $ifNull: ['$brand_data.name', ''] } } },
      { $unset: 'brand_data' },

      {
        $lookup: {
          from: mongoManager.CATEGORY_COLL,
          localField: 'categories',
          foreignField: '_id',
          pipeline: [
            { $match: { category_group: 'products' } },
            { $project: { name: 1 } },
            { $sort: { name: 1 } },
          ],
          as: 'categories',
        },
      },

      {
        $lookup: {
          from: mongoManager.PRODUCTS_COLL,
          let: {
            upsells: { $ifNull: ['$linked_products.upsells', []] },
            cross_sells: { $ifNull: ['$linked_products.cross_sells', []] },
            related: { $ifNull: ['$linked_products.related', []] },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$status', 'published'] },
                    {
                      $in: [
                        '$_id',
                        {
                          $concatArrays: [
                            '$$upsells',
                            '$$cross_sells',
                            '$$related',
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            { $project: { _id: 1, product_group_id: 1, title: 1 } },
            { $sort: { _id: -1 } },
          ],
          as: 'linked_products_data',
        },
      },
      {
        $addFields: {
          linked_products: {
            upsells: {
              $filter: {
                input: '$linked_products_data',
                as: 'lp',
                cond: { $in: ['$$lp._id', '$linked_products.upsells'] },
              },
            },
            cross_sells: {
              $filter: {
                input: '$linked_products_data',
                as: 'lp',
                cond: { $in: ['$$lp._id', '$linked_products.cross_sells'] },
              },
            },
            related: {
              $filter: {
                input: '$linked_products_data',
                as: 'lp',
                cond: { $in: ['$$lp._id', '$linked_products.related'] },
              },
            },
          },
        },
      },
      { $unset: 'linked_products_data' },

      {
        $lookup: {
          from: mongoManager.FEATURES_COLL,
          let: {
            features_arr: { $ifNull: ['$features', []] },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    '$_id',
                    {
                      $map: {
                        input: '$$features_arr',
                        as: 'f',
                        in: '$$f.feature_id',
                      },
                    },
                  ],
                },
              },
            },
            {
              $addFields: {
                value: {
                  $filter: {
                    input: '$values',
                    as: 'value',
                    cond: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$$features_arr',
                            as: 'feature',
                            cond: {
                              $and: [
                                { $eq: ['$$feature.feature_id', '$_id'] },
                                { $eq: ['$$feature.value_id', '$$value.id'] },
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
              },
            },
            { $unwind: { path: '$value', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                feature_id: '$_id',
                name: 1,
                value_id: '$value.id',
                value_name: '$value.value',
              },
            },
          ],
          as: 'features',
        },
      },

      { $project: { schema_version: 0 } },
      { $sort: { _id: -1 } },
    ])
    .toArray()) as IProductLookupDocument[]

  if (lookedupData.length === 0) {
    return {
      success: false,
      errors: {
        general: productErrors['EMPTY_PRODUCTS'].server,
        code: 'EMPTY_PRODUCTS',
      },
    }
  }

  const lookedupDataWithId: TProductLookupDataWithId[] = lookedupData.map(
    ({
      _id,
      author_id,
      brand_id,
      categories,
      pricing,
      linked_products: { upsells, cross_sells, related },
      features,
      ...rest
    }) => ({
      id: _id.toHexString(),
      author_id: author_id.toHexString(),
      brand_id: brand_id?.toHexString() || null,
      categories: categories.length
        ? categories.map(({ _id, name }) => ({ id: _id.toHexString(), name }))
        : [],
      pricing: {
        ...pricing,
        prices: pricing.prices.map(({ offer_id, guarantee_id, ...rest }) => ({
          ...rest,
          offer_id: offer_id ? offer_id.toHexString() : null,
          guarantee_id: guarantee_id ? guarantee_id.toHexString() : null,
        })),
      },
      linked_products: {
        upsells: upsells.length
          ? upsells.map(({ _id, product_group_id, title }) => ({
              id: _id.toHexString(),
              product_group_id,
              title,
            }))
          : [],
        cross_sells: cross_sells
          ? cross_sells.map(({ _id, product_group_id, title }) => ({
              id: _id.toHexString(),
              product_group_id,
              title,
            }))
          : [],
        related: related
          ? related.map(({ _id, product_group_id, title }) => ({
              id: _id.toHexString(),
              product_group_id,
              title,
            }))
          : [],
      },
      features: features.length
        ? features.map(({ feature_id, ...rest }) => ({
            feature_id: feature_id?.toHexString(),
            ...rest,
          }))
        : [],
      ...rest,
    }),
  )

  return {
    success: true,
    products: lookedupDataWithId,
  }
}
