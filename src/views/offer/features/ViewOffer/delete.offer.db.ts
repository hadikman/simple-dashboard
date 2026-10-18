import { ObjectId } from 'mongodb'

import { type IProductDocument } from '@/views/product'

import {
  type IOfferDocument,
  type TDeleteOfferData,
  type TDeleteOfferResponse,
  offerErrors,
} from '../../shared'

import { mongoManager } from '@/config/db/MongoManager'

export async function deleteOffer(
  deleteOfferData: TDeleteOfferData,
): Promise<TDeleteOfferResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const offersColl = db.collection<IOfferDocument>(mongoManager.OFFERS_COLL)
  const productsColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_COLL,
  )
  const productsDraftColl = db.collection<IProductDocument>(
    mongoManager.PRODUCTS_DRAFT_COLL,
  )

  const { id, name } = deleteOfferData
  const objectId = new ObjectId(id)

  const affectedProducts = await productsColl
    .find({ 'pricing.prices.offer_id': objectId })
    .project({ _id: 1 })
    .toArray()

  const affectedDrafts = await productsDraftColl
    .find({ 'pricing.prices.offer_id': objectId })
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
    { 'pricing.prices.offer_id': objectId },
    {
      $set: {
        'pricing.prices.$[elem].offer_id': null,
        'pricing.prices.$[elem].offer_name': '',
        'pricing.prices.$[elem].offer_discount': 0,
      },
      $pull: { offers: { offer_id: objectId } },
    },
    {
      arrayFilters: [{ 'elem.offer_id': objectId }],
    },
  )

  await productsDraftColl.updateMany(
    { 'pricing.prices.offer_id': objectId },
    {
      $set: {
        'pricing.prices.$[elem].offer_id': null,
        'pricing.prices.$[elem].offer_name': '',
        'pricing.prices.$[elem].offer_discount': 0,
      },
      $pull: { offers: { offer_id: objectId } },
    },
    {
      arrayFilters: [{ 'elem.offer_id': objectId }],
    },
  )

  const deleteResult = await offersColl.deleteOne({ _id: objectId })

  if (deleteResult.deletedCount === 0) {
    return {
      success: false,
      errors: {
        general: offerErrors['DELETE_FAILURE'].server,
        code: 'DELETE_FAILURE',
      },
    }
  }

  return {
    success: true,
    offer: { name },
    productsId,
    productsDraftId,
  }
}
