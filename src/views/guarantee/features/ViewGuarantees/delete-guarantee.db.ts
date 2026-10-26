import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IGuaranteeDocument,
  type TDeleteGuaranteeData,
  type TDeleteGuaranteeResponse,
  guaranteeErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function deleteGuarantee(
  deleteGuaranteeData: TDeleteGuaranteeData,
): Promise<TDeleteGuaranteeResponse> {
  const guaranteesColl = await mongoManager.getCollection<IGuaranteeDocument>(
    COLLECTIONS.GUARANTEES,
  )
  const productsColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS,
  )
  const productsDraftColl = await mongoManager.getCollection<IProductDocument>(
    COLLECTIONS.PRODUCTS_DRAFT,
  )

  const { id, name } = deleteGuaranteeData
  const objectId = new ObjectId(id)

  const affectedProducts = await productsColl
    .find({ 'pricing.prices.guarantee_id': objectId })
    .project({ _id: 1 })
    .toArray()

  const affectedDrafts = await productsDraftColl
    .find({ 'pricing.prices.guarantee_id': objectId })
    .project({ _id: 1 })
    .toArray()

  const productsId: { id: string }[] = []
  for (let i = 0; i < affectedProducts.length; i++) {
    productsId.push({ id: affectedProducts[i]._id.toHexString() })
  }

  const productsDraftId: { id: string }[] = []
  for (let i = 0; i < affectedDrafts.length; i++) {
    productsDraftId.push({ id: affectedDrafts[i]._id.toHexString() })
  }

  await productsColl.updateMany(
    { 'pricing.prices.guarantee_id': objectId },
    {
      $set: {
        'pricing.prices.$[elem].guarantee_id': null,
        'pricing.prices.$[elem].guarantee_name': '',
      },
    },
    {
      arrayFilters: [{ 'elem.guarantee_id': objectId }],
    },
  )

  await productsDraftColl.updateMany(
    { 'pricing.prices.guarantee_id': objectId },
    {
      $set: {
        'pricing.prices.$[elem].guarantee_id': null,
        'pricing.prices.$[elem].guarantee_name': '',
      },
    },
    {
      arrayFilters: [{ 'elem.guarantee_id': objectId }],
    },
  )

  const deleteResult = await guaranteesColl.deleteOne({ _id: objectId })

  if (deleteResult.deletedCount === 0) {
    return {
      success: false,
      errors: {
        general: guaranteeErrors['DELETE_FAILURE'].server,
        code: 'DELETE_FAILURE',
      },
    }
  }

  return {
    success: true,
    guarantee: { name },
    productsId,
    productsDraftId,
  }
}
