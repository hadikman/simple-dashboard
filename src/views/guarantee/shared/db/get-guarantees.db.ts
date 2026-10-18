import {
  type IGuaranteeDocument,
  type IGuaranteeLookupDocument,
  type TGetGuaranteesResponse,
  type TGuaranteeLookupDataWithId,
  guaranteeErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function getGuarantees(): Promise<TGetGuaranteesResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IGuaranteeDocument>(
    mongoManager.GUARANTEES_COLL,
  )

  const lookedupData = (await collection
    .aggregate([
      { $match: {} },

      {
        $lookup: {
          from: mongoManager.PRODUCTS_COLL,
          localField: 'target_items.product_id',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                title: 1,
                'pricing.prices.id': 1,
                'pricing.prices.name': 1,
                'pricing.prices.price': 1,
              },
            },
          ],
          as: 'products_data',
        },
      },

      {
        $lookup: {
          from: mongoManager.CATEGORY_COLL,
          localField: 'target_items.category_id',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 1, name: 1 } }],
          as: 'categories_data',
        },
      },

      {
        $lookup: {
          from: mongoManager.BRANDS_COLL,
          localField: 'brand_id',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 1, name: 1 } }],
          as: 'brand_data',
        },
      },

      {
        $addFields: {
          brand_name: {
            $let: {
              vars: {
                matchedBrand: {
                  $arrayElemAt: ['$brand_data', 0],
                },
              },
              in: {
                $ifNull: ['$$matchedBrand.name', ''],
              },
            },
          },

          target_items: {
            $map: {
              input: '$target_items',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    product_name: {
                      $let: {
                        vars: {
                          matchedProduct: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$products_data',
                                  as: 'p',
                                  cond: {
                                    $eq: ['$$p._id', '$$item.product_id'],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          $ifNull: ['$$matchedProduct.title', ''],
                        },
                      },
                    },

                    price_name: {
                      $let: {
                        vars: {
                          matchedProduct: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$products_data',
                                  as: 'p',
                                  cond: {
                                    $eq: ['$$p._id', '$$item.product_id'],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          $let: {
                            vars: {
                              matchedPrice: {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: {
                                        $ifNull: [
                                          '$$matchedProduct.pricing.prices',
                                          [],
                                        ],
                                      },
                                      as: 'pr',
                                      cond: {
                                        $eq: ['$$pr.id', '$$item.price_id'],
                                      },
                                    },
                                  },
                                  0,
                                ],
                              },
                            },
                            in: {
                              $ifNull: ['$$matchedPrice.name', ''],
                            },
                          },
                        },
                      },
                    },

                    category_name: {
                      $let: {
                        vars: {
                          matchedCategory: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$categories_data',
                                  as: 'c',
                                  cond: {
                                    $eq: ['$$c._id', '$$item.category_id'],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          $ifNull: ['$$matchedCategory.name', ''],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },

      { $unset: ['products_data', 'categories_data', 'brand_data'] },
      { $project: { schema_version: 0 } },
      { $sort: { _id: -1 } },
    ])
    .toArray()) as IGuaranteeLookupDocument[]

  if (lookedupData.length === 0) {
    return {
      success: false,
      errors: {
        general: guaranteeErrors['EMPTY_GUARANTEES'].server,
        code: 'EMPTY_GUARANTEES',
      },
    }
  }

  const lookedupDataWithId: TGuaranteeLookupDataWithId[] = lookedupData.map(
    ({ _id, target_items, brand_id, ...rest }) => ({
      ...rest,
      id: _id.toHexString(),
      brand_id: brand_id?.toHexString() || null,
      target_items: target_items
        ? target_items.map(({ product_id, category_id, ...rest }) => ({
            ...rest,
            product_id: product_id.toHexString(),
            category_id: category_id?.toHexString() || null,
          }))
        : [],
    }),
  )

  return {
    success: true,
    guarantees: lookedupDataWithId,
  }
}
