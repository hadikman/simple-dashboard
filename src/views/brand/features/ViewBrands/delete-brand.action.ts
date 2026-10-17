'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { type TDeleteBrandData } from '../../shared'

import { deleteBrand } from './delete.brand.db'

export async function deleteBrandAction(data: TDeleteBrandData) {
  const result = await deleteBrand(data)

  if (result.success) {
    updateTag('brand-' + result.brand.id)
    updateTag('brands-props')
    updateTag('brands-list')

    if (result.modifiedProductsCount) {
      const route = '/dashboard/products/all-products/[slug]'
      revalidatePath(route)
    }
    if (result.modifiedProductsDraftCount) {
      const route = '/dashboard/products/all-products/draft/[slug]'
      revalidatePath(route)
    }
  }

  return result
}
