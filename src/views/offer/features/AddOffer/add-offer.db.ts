import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IOfferDocument,
  type TAddOfferResponse,
  type TOfferData,
  offerErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'
import { getCurrentUTCDate } from '@/helpers/utils'

export async function addOffer(
  offerData: TOfferData,
): Promise<TAddOfferResponse> {
  const offersColl = await mongoManager.getCollection<IOfferDocument>(
    COLLECTIONS.OFFERS,
  )
  const productsColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )

  const { target_items, ...rest } = offerData

  const existingOffer = await offersColl.findOne({
    slug: offerData.slug,
  })

  if (existingOffer) {
    return {
      success: false,
      errors: {
        general: offerErrors['OFFER_EXISTS'].server,
        code: 'OFFER_EXISTS',
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

  const newOfferDoc: IOfferDocument = {
    schema_version: 1.0,
    ...rest,

    target_items: targetItemsObjectId,
    created_at: getCurrentUTCDate(),
    updated_at: null,
  }

  const data = await offersColl.insertOne(newOfferDoc)

  if (!data) {
    return {
      success: false,
      errors: {
        general: offerErrors['CREATE_FAILURE'].server,
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

    prices?.push(price_id)
  }

  for (const [productId, priceIds] of priceIdsMap) {
    const productObjectId = new ObjectId(productId)

    await productsColl.updateOne(
      { _id: productObjectId },
      {
        $set: {
          'pricing.prices.$[elem].offer_id': data.insertedId,
          'pricing.prices.$[elem].offer_name': rest.name,
          'pricing.prices.$[elem].offer_discount': rest.discount,
        },
      },
      {
        arrayFilters: [{ 'elem.id': { $in: priceIds } }],
      },
    )
  }

  return {
    success: true,
    offer: { id: data.insertedId.toHexString() },
  }
}
