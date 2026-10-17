'use server'

import { cacheTag } from 'next/cache'

import { type TQueryFeatureData } from '../../shared'

import { getFeature } from './get-feature.db'

export async function queryFeature(data: TQueryFeatureData) {
  'use cache'

  const result = await getFeature(data)

  if (result.success) {
    cacheTag('feature-' + result.feature.id)
  }

  return result
}
