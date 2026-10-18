import {
  type IGuaranteeDocument,
  type TCheckDuplicateGuaranteeResponse,
  type TQueryDuplicateGuaranteePropData,
  guaranteeErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function checkDuplicateGuarantee(
  queryDuplicateGuaranteePropData: TQueryDuplicateGuaranteePropData,
): Promise<TCheckDuplicateGuaranteeResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IGuaranteeDocument>(
    mongoManager.GUARANTEES_COLL,
  )

  const { key, value } = queryDuplicateGuaranteePropData

  const existingGuarantee = await collection.findOne({ [key]: value })

  if (existingGuarantee) {
    return {
      isDuplicate: true,
      message: {
        general: guaranteeErrors['DUPLICATE_PROP'].server,
        code: 'DUPLICATE_PROP',
      },
    }
  }

  return {
    isDuplicate: false,
    message: null,
  }
}
