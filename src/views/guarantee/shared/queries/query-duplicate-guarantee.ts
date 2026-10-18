'use server'

import { type TQueryDuplicateGuaranteePropData } from '../'

import { checkDuplicateGuarantee } from '../db/check-duplicate-guarantee.db'

export async function queryDuplicateGuarantee(
  data: TQueryDuplicateGuaranteePropData,
) {
  return await checkDuplicateGuarantee(data)
}
