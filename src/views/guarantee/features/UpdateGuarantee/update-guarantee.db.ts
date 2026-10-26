import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IGuaranteeDocument,
  type IGuaranteeTargetItem,
  type IGuaranteeTargetItemWithId,
  type TUpdateGuaranteeData,
  type TUpdateGuaranteeResponse,
  guaranteeErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'
import { getCurrentUTCDate } from '@/helpers/utils'

export async function updateGuarantee(
  updateGuaranteeData: TUpdateGuaranteeData,
): Promise<TUpdateGuaranteeResponse> {
  const guaranteeColl = await mongoManager.getCollection<IGuaranteeDocument>(
    COLLECTIONS.GUARANTEES,
  )
  const productsColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )
  const productsDraftColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS_DRAFT,
  )

  const { id, target_items, brand_id, ...rest } = updateGuaranteeData
  const objectId = new ObjectId(id)

  const productsId: { id: string }[] = []
  const priceIdsMap = new Map<string, string[]>()
  const removedItemsMap = new Map<string, string[]>()
  const retainedItems: IGuaranteeTargetItem[] = []

  // 1. Split active vs unselected items before updating documents
  if (target_items !== undefined) {
    for (let i = 0; i < target_items.length; i++) {
      const item = (
        target_items as (IGuaranteeTargetItemWithId & {
          guarantee_id?: string
        })[]
      )[i]
      const {
        product_group_id,
        product_id,
        category_id,
        price_id,
        guarantee_id,
      } = item
      const pgid = product_group_id

      productsId.push({ id: product_id })

      if (guarantee_id === null) {
        // Group prices that need their guarantee links removed
        const removedPrices = removedItemsMap.get(pgid)
        if (!removedPrices) {
          removedItemsMap.set(pgid, [price_id])
        } else {
          removedPrices.push(price_id)
        }
      } else {
        // Prepare items to be saved into the Guarantee document's target_items list
        retainedItems.push({
          ...item,
          product_id: new ObjectId(product_id),
          category_id: category_id ? new ObjectId(category_id) : null,
          price_id,
        })

        // Group prices that need their guarantee links added/retained
        const prices = priceIdsMap.get(pgid)
        if (!prices) {
          priceIdsMap.set(pgid, [price_id])
        } else {
          prices.push(price_id)
        }
      }
    }
  }

  // 2. Build the guarantee document update payload
  const updateDoc: Record<string, unknown> = {
    ...rest,
    updated_at: getCurrentUTCDate(),
  }

  if (target_items !== undefined) {
    updateDoc.target_items = retainedItems
  }

  if (brand_id !== undefined) {
    updateDoc.brand_id = brand_id ? new ObjectId(brand_id) : null
  }

  const data = await guaranteeColl.findOneAndUpdate(
    { _id: objectId },
    { $set: updateDoc },
    { returnDocument: 'after' },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: guaranteeErrors['UPDATE_FAILURE'].server,
        code: 'UPDATE_FAILURE',
      },
    }
  }

  // 3. Apply changes across draft/published products
  if (target_items !== undefined) {
    const { name } = data

    // Add/update references for selected/retained prices
    for (const [productGroupId, priceIds] of priceIdsMap) {
      const updateFields = getGuaranteeUpdateFields({ id: objectId, name })

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

    // Clear references for unselected prices
    for (const [productGroupId, priceIds] of removedItemsMap) {
      const clearFields = getGuaranteeUpdateFields({})

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
    guarantee: { id, slug: rest.slug || '' },
    productsId,
  }
}

function getGuaranteeUpdateFields({
  id,
  name,
}: {
  id?: ObjectId
  name?: string | null
}) {
  return {
    'pricing.prices.$[elem].guarantee_id': id ?? null,
    'pricing.prices.$[elem].guarantee_name': name ?? '',
  }
}
