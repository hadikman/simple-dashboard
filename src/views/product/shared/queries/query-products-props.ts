'use server'

import { cacheTag } from 'next/cache'

import { type TQueryProductsPropsData } from '../'

import { getProductsProps } from '../db/get-products-props.db'

export async function queryProductsProps<T>(data: TQueryProductsPropsData<T>) {
  'use cache'

  const result = await getProductsProps(data)

  if (result.success) {
    if (data.type === 'draft') {
      cacheTag('products-props-draft')
    } else {
      cacheTag('products-props')
    }
  }

  return result
}
