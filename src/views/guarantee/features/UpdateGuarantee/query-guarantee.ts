'use server'

import { cacheTag } from 'next/cache'

import { type TQueryGuaranteeData } from '../../shared/guarantee.types'

import { getGuarantee } from './get-guarantee.db'

export async function queryGuarantee(data: TQueryGuaranteeData) {
  'use cache'

  const result = await getGuarantee(data)

  if (result.success) {
    cacheTag('guarantee-' + result.guarantee.id)
  }

  return result
}
