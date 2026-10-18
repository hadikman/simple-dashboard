'use server'

import { cacheTag } from 'next/cache'

import type { ProjectionKeys } from '@/helpers/ts-utils'

import { type IGuaranteeDocument } from '../'

import { getGuaranteesProps } from '../db/get-guarantees-props.db'

export async function queryGuaranteesProps(
  keys: ProjectionKeys<IGuaranteeDocument>,
) {
  'use cache'

  const result = await getGuaranteesProps(keys)

  if (result.success) {
    cacheTag('guarantees-props')
  }

  return result
}
