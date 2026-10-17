'use server'

import { cacheTag } from 'next/cache'

import { type TQueryBrandsPropsData } from '../'

import { getBrandsProps } from '../db/get-brands-props.db'

export async function queryBrandsProps<T>(data: TQueryBrandsPropsData<T>) {
  'use cache'

  const result = await getBrandsProps(data)

  if (result.success) {
    cacheTag('brands-props')
  }

  return result
}
