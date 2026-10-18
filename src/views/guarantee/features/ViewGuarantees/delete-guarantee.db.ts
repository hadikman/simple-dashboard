import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IGuaranteeDocument,
  type TDeleteGuaranteeData,
  type TDeleteGuaranteeResponse,
  guaranteeErrors,
} from '../../shared'

import { mongoManager } from '@/config/db/MongoManager'

export async function deleteGuarantee(
  deleteGuaranteeData: TDeleteGuaranteeData,
): Promise<TDeleteGuaranteeResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const guaranteesColl = db.collection<IGuaranteeDocument>(
    mongoManager.GUARANTEES_COLL,
  )
  const productsColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_COLL,
  )
  const productsDraftColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_DRAFT_COLL,
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
