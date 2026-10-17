'use server'

import { type TQueryDuplicateFeaturePropData } from '../'

import { checkDuplicateFeature } from '../db/check-duplicate-feature.db'

export async function queryDuplicateFeature(
  data: TQueryDuplicateFeaturePropData,
) {
  return await checkDuplicateFeature(data)
}
