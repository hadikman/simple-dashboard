import {
  type IGuaranteeDocument,
  type TCheckDuplicateGuaranteeResponse,
  type TQueryDuplicateGuaranteePropData,
  guaranteeErrors,
} from '../'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function checkDuplicateGuarantee(
  queryDuplicateGuaranteePropData: TQueryDuplicateGuaranteePropData,
): Promise<TCheckDuplicateGuaranteeResponse> {
  const collection = await mongoManager.getCollection<IGuaranteeDocument>(
    COLLECTIONS.GUARANTEES,
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
