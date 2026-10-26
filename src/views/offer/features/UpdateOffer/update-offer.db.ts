import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IOfferDocument,
  type IOfferTargetItem,
  type IOfferTargetItemWithId,
  type TUpdateOfferData,
  type TUpdateOfferResponse,
  offerErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'
import { getCurrentUTCDate } from '@/helpers/utils'

export async function updateOffer(
  updateOfferData: TUpdateOfferData,
): Promise<TUpdateOfferResponse> {
  const offersColl = await mongoManager.getCollection<IOfferDocument>(
    COLLECTIONS.OFFERS,
  )
  const productsColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )
  const productsDraftColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS_DRAFT,
  )

  const { id, target_items, ...rest } = updateOfferData
  const objectId = new ObjectId(id)

  const productsId: { id: string }[] = []
  const priceIdsMap = new Map<string, string[]>()
  const removedItemsMap = new Map<string, string[]>()
  const retainedItems: IOfferTargetItem[] = []

  // 1. Split active vs unselected items before updating documents
  if (target_items !== undefined) {
    for (let i = 0; i < target_items.length; i++) {
      const item = (
        target_items as (IOfferTargetItemWithId & {
          offer_id?: string
        })[]
      )[i]
      const { product_group_id, product_id, category_id, price_id, offer_id } =
        item

      const pgid = product_group_id

      productsId.push({ id: product_id })

      if (offer_id === null) {
        // Group prices that need their offer links removed
        const removedPrices = removedItemsMap.get(pgid)
        if (!removedPrices) {
          removedItemsMap.set(pgid, [price_id])
        } else {
          removedPrices.push(price_id)
        }
      } else {
        // Prepare items to be saved into the Offer document's target_items list
        retainedItems.push({
          ...item,
          product_id: new ObjectId(product_id),
          category_id: category_id ? new ObjectId(category_id) : null,
        })

        // Group prices that need their offer links added/retained
        const prices = priceIdsMap.get(pgid)
        if (!prices) {
          priceIdsMap.set(pgid, [price_id])
        } else {
          prices.push(price_id)
        }
      }
    }
  }

  // 2. Build the offer document update payload
  const updateDoc: Record<string, unknown> = {
    ...rest,
    updated_at: getCurrentUTCDate(),
  }

  if (target_items !== undefined) {
    updateDoc.target_items = retainedItems
  }

  const data = await offersColl.findOneAndUpdate(
    { _id: objectId },
    { $set: updateDoc },
    { returnDocument: 'after' },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: offerErrors['UPDATE_FAILURE'].server,
        code: 'UPDATE_FAILURE',
      },
    }
  }

  // 3. Apply changes across draft/published products
  if (target_items !== undefined) {
    const { name, discount } = data

    // Add/update references for selected/retained prices
    for (const [productGroupId, priceIds] of priceIdsMap) {
      const updateFields = getOfferUpdateFields({
        id: objectId,
        name,
        discount,
      })

      await productsColl.updateOne(
        { product_group_id: productGroupId },
        { $set: updateFields },
        { arrayFilters: [{ 'elem.id': { $in: priceIds } }] },
      )
      await productsDraftColl.updateOne(
        { product_group_id: productGroupId },
        { $set: updateFields },
        { arrayFilters: [{ 'elem.id': { $in: priceIds } }] },
      )
    }

    // Clear references for unselected prices (using removedItemsMap)
    for (const [productGroupId, priceIds] of removedItemsMap) {
      const clearFields = getOfferUpdateFields({})

      await productsColl.updateOne(
        { product_group_id: productGroupId },
        { $set: clearFields },
        { arrayFilters: [{ 'elem.id': { $in: priceIds } }] },
      )
      await productsDraftColl.updateOne(
        { product_group_id: productGroupId },
        { $set: clearFields },
        { arrayFilters: [{ 'elem.id': { $in: priceIds } }] },
      )
    }
  }

  return {
    success: true,
    offer: { id, slug: rest.slug || '' },
    productsId,
  }
}

function getOfferUpdateFields({
  id,
  name,
  discount,
}: {
  id?: ObjectId
  name?: string | null
  discount?: number | null
}) {
  return {
    'pricing.prices.$[elem].offer_id': id ?? null,
    'pricing.prices.$[elem].offer_name': name ?? '',
    'pricing.prices.$[elem].offer_discount': discount ?? 0,
  }
}
