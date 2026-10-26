import {
  type IOfferDocument,
  type IOfferLookupDocument,
  type TGetOffersResponse,
  type TOfferLookupDataWithId,
  offerErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getOffers(): Promise<TGetOffersResponse> {
  const collection = await mongoManager.getCollection<IOfferDocument>(
    COLLECTIONS.OFFERS,
  )

  const lookedupData = (await collection
    .aggregate([
      { $match: {} },

      {
        $lookup: {
          from: COLLECTIONS.PRODUCTS,
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
          from: COLLECTIONS.CATEGORY,
          localField: 'target_items.category_id',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 1, name: 1 } }],
          as: 'categories_data',
        },
      },

      {
        $addFields: {
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

      { $unset: ['products_data', 'categories_data'] },

      { $project: { schema_version: 0 } },
      { $sort: { _id: -1 } },
    ])
    .toArray()) as IOfferLookupDocument[]

  if (lookedupData.length === 0) {
    return {
      success: false,
      errors: {
        general: offerErrors['EMPTY_OFFERS'].server,
        code: 'EMPTY_OFFERS',
      },
    }
  }

  const lookedupDataWithId: TOfferLookupDataWithId[] = lookedupData.map(
    ({ _id, target_items, ...rest }) => ({
      ...rest,
      id: _id.toHexString(),
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
    offers: lookedupDataWithId,
  }
}
