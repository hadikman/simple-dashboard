'use server'

import { cacheTag } from 'next/cache'

import type { ProjectionKeys } from '@/helpers/ts-utils'

import { type IFeatureDocument } from '../'

import { getFeaturesProps } from '../db/get-features-props.db'

export async function queryFeaturesProps(
  keys: ProjectionKeys<IFeatureDocument>,
) {
  'use cache'

  const result = await getFeaturesProps(keys)

  if (result.success) {
    cacheTag('features-props')
  }

  return result
}
