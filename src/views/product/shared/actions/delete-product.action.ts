'use server'

import { revalidateTag, updateTag } from 'next/cache'

import { type TDeleteProductData, deletePublishedSlugCache } from '../'

import { deleteProduct } from '../db/delete.product.db'

export async function deleteProductAction(data: TDeleteProductData) {
  const result = await deleteProduct(data)

  if (result.success) {
    if (data.onlyDeleteDraft) {
      updateTag('product-draft-' + result.product.id)
      updateTag('products-props-draft')
      updateTag('products-draft-list')
    } else {
      updateTag('product-' + result.product.id)
      updateTag('products-props')
      updateTag('products-list')
      revalidateTag('products-for-linking-list', 'max')

      deletePublishedSlugCache(data.productGroupId)
    }
  }

  return result
}
