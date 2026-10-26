import { ObjectId } from 'mongodb'

import type { Prettify } from '@/helpers/ts-utils'

import {
  type IProductDocument,
  type TCopyProductData,
  type TCopyProductResponse,
  productErrors,
} from '../../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function copyProduct({
  id,
}: TCopyProductData): Promise<TCopyProductResponse> {
  const collection = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )

  const objectId = new ObjectId(id)

  const existingProduct = (await collection.findOne(
    { _id: objectId },
    { projection: { _id: 0, product_group_id: 0 } },
  )) as Prettify<Omit<IProductDocument, 'product_group_id'>>

  if (!existingProduct) {
    return {
      success: false,
      errors: {
        general: productErrors['NOT_FOUND_PRODUCT'].server,
        code: 'NOT_FOUND_PRODUCT',
      },
    }
  }

  const { schema_version, title, slug, ...rest } = existingProduct

  const productGroupId = crypto.randomUUID().split('-')[0]

  // Clean base title (remove any existing -number suffix)
  const baseTitle = title.replace(/-\d+$/, '')
  const baseSlug = slug.replace(/-\d+$/, '')

  // Find highest number with a single aggregation query
  const result = await collection
    .aggregate([
      {
        $match: {
          title: { $regex: `^${baseTitle}(-\\d+)?$` },
        },
      },
      {
        $project: {
          number: {
            $cond: [
              { $regexMatch: { input: '$title', regex: /-(\d+)$/ } },
              { $toInt: { $arrayElemAt: [{ $split: ['$title', '-'] }, -1] } },
              0,
            ],
          },
        },
      },
      { $sort: { number: -1 } },
      { $limit: 1 },
    ])
    .toArray()

  const maxNumber = result.length > 0 ? result[0].number : 0
  const nextNumber = maxNumber + 1

  const copyTitle = `${baseTitle}-${nextNumber}`
  const copySlug = `${baseSlug}-${nextNumber}`

  const copyProduct: IProductDocument = {
    schema_version,
    title: copyTitle,
    slug: copySlug,
    product_group_id: productGroupId,
    ...rest,
  }

  const data = await collection.insertOne(copyProduct)

  if (!data) {
    return {
      success: false,
      errors: {
        general: productErrors['COPY_FAILURE'].server,
        code: 'COPY_FAILURE',
      },
    }
  }

  return {
    success: true,
    product: {
      id: data.insertedId.toHexString(),
      title: copyTitle,
      slug: copySlug,
    },
  }
}
