import { ObjectId } from 'mongodb'

import {
  type IBrandDocument,
  type TAddBrandResponse,
  type TBrandData,
  brandErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'
import { getCurrentUTCDate } from '@/helpers/utils'

export async function addBrand(
  brandData: TBrandData,
): Promise<TAddBrandResponse> {
  const collection = await mongoManager.getCollection<IBrandDocument>(
    COLLECTIONS.BRANDS,
  )

  const existingBrand = await collection.findOne({
    $or: [{ name: brandData.name }, { slug: brandData.slug }],
  })
  if (existingBrand) {
    return {
      success: false,
      errors: {
        general: brandErrors['BRAND_EXISTS'].server,
        code: 'BRAND_EXISTS',
      },
    }
  }

  const { categories } = brandData

  const categoriesObjectIdOrEmptyArr = categories.length
    ? categories.map(id => new ObjectId(id))
    : []

  const newBrandDoc: IBrandDocument = {
    ...brandData,
    schema_version: 1.0,

    categories: categoriesObjectIdOrEmptyArr,

    created_at: getCurrentUTCDate(),
    updated_at: null,
  }

  const data = await collection.insertOne(newBrandDoc)

  if (!data) {
    return {
      success: false,
      errors: {
        general: brandErrors['CREATE_FAILURE'].server,
        code: 'CREATE_FAILURE',
      },
    }
  }

  return {
    success: true,
    brand: { id: data.insertedId.toHexString() },
  }
}
