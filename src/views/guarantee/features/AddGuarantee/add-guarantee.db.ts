import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IGuaranteeDocument,
  type TAddGuaranteeResponse,
  type TGuaranteeData,
  guaranteeErrors,
} from '../../shared'

import { mongoManager } from '@/config/db/MongoManager'
import { getCurrentUTCDate } from '@/helpers/utils'

export async function addGuarantee(
  guaranteeData: TGuaranteeData,
): Promise<TAddGuaranteeResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const guaranteesColl = db.collection<IGuaranteeDocument>(
    mongoManager.GUARANTEES_COLL,
  )
  const productsColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_COLL,
  )

  const { target_items, brand_id, ...rest } = guaranteeData

  const existingGuarantee = await guaranteesColl.findOne({
    slug: guaranteeData.slug,
  })

  if (existingGuarantee) {
    return {
      success: false,
      errors: {
        general: guaranteeErrors['GUARANTEE_EXISTS'].server,
        code: 'GUARANTEE_EXISTS',
      },
    }
  }

  const targetItemsObjectId = target_items.map(
    ({ product_id, category_id, ...rest }) => ({
      product_id: new ObjectId(product_id),
      category_id: category_id ? new ObjectId(category_id) : null,
      ...rest,
    }),
  )

  const newGuaranteeDoc: IGuaranteeDocument = {
    schema_version: 1.0,

    ...rest,
    brand_id: brand_id ? new ObjectId(brand_id) : null,
    brand_name: rest.brand_name || '',
    target_items: targetItemsObjectId,
    created_at: getCurrentUTCDate(),
    updated_at: null,
  }

  const data = await guaranteesColl.insertOne(newGuaranteeDoc)

  if (!data) {
    return {
      success: false,
      errors: {
        general: guaranteeErrors['CREATE_FAILURE'].server,
        code: 'CREATE_FAILURE',
      },
    }
  }

  const priceIdsMap = new Map<string, string[]>()
  for (let i = 0; i < targetItemsObjectId.length; i++) {
    const { product_id, price_id } = targetItemsObjectId[i]
    const pid = product_id.toHexString()

    const prices = priceIdsMap.get(pid)
    if (!prices) {
      priceIdsMap.set(pid, [price_id])
      continue
    }

    prices.push(price_id)
  }

  for (const [productId, priceIds] of priceIdsMap) {
    const productObjectId = new ObjectId(productId)

    await productsColl.updateOne(
      { _id: productObjectId },
      {
        $set: {
          'pricing.prices.$[elem].guarantee_id': data.insertedId,
          'pricing.prices.$[elem].guarantee_name': rest.name,
        },
      },
      {
        arrayFilters: [{ 'elem.id': { $in: priceIds } }],
      },
    )
  }

  return {
    success: true,
    guarantee: { id: data.insertedId.toHexString() },
  }
}
