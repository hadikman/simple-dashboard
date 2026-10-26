import { ObjectId } from 'mongodb'

import type { ProjectionKeys, WithId } from '@/helpers/ts-utils'

import {
  type IOfferDocument,
  type TGetOffersPropsResponse,
  offerErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getOffersProps<
  T extends Partial<Record<keyof IOfferDocument, unknown>>,
>(keys: ProjectionKeys<T>): Promise<TGetOffersPropsResponse<T>> {
  const collection = await mongoManager.getCollection<IOfferDocument>(
    COLLECTIONS.OFFERS,
  )

  const cursor = collection.find()
  const projectCursor = cursor.project<T & { _id: ObjectId }>(keys)
  const data = await projectCursor.toArray()

  if (data.length === 0) {
    return {
      success: false,
      errors: {
        general: offerErrors['NOT_FOUND_OFFERS_PROPS'].server,
        code: 'NOT_FOUND_OFFERS_PROPS',
      },
    }
  }

  const formattedData = data.map(({ _id, ...rest }) => ({
    ...rest,
    id: _id.toHexString(),
  })) as unknown as WithId<T>[]

  return {
    success: true,
    offers: formattedData,
  }
}
