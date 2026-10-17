'use server'

import { revalidateTag, updateTag } from 'next/cache'

import { type TDeleteProductsData, deletePublishedSlugCache } from '../'

import { deleteProducts } from '../db/delete.products.db'

export async function deleteProductsAction(data: TDeleteProductsData) {
  const result = await deleteProducts(data)

  if (result.success) {
    data.forEach(
      ({ id, hasDraft, isPublished, onlyDeleteDraft, productGroupId }) => {
        if (hasDraft && !isPublished) {
          // Audit
          updateTag('product-draft-' + id)
        } else if (onlyDeleteDraft) {
          // Draft & published version
          updateTag('product-draft-' + id)
          updateTag('product-' + id)
        } else {
          // Published
          updateTag('product-' + id)

          deletePublishedSlugCache(productGroupId)
        }
      },
    )

    if (data.some(({ hasDraft }) => hasDraft)) {
      updateTag('products-props-draft')
      updateTag('products-draft-list')
    }

    updateTag('products-props')
    updateTag('products-list')
    revalidateTag('products-for-linking-list', 'max')
  }

  return result
}
