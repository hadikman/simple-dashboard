'use server'

import { updateTag } from 'next/cache'

import { type TCopyProductData } from '../../../shared'

import { copyProduct } from '../db/copy-product.db'

export async function copyProductAction(copyProductData: TCopyProductData) {
  const result = await copyProduct(copyProductData)

  if (result.success) {
    updateTag('products-props')
    updateTag('products-list')
  }

  return result
}
