'use server'

import { updateTag } from 'next/cache'

import { type TDuplicateProductIntoDraftData, queryProduct } from '../../shared'

import { duplicateProductIntoDraft } from './duplicate-product-into-draft.db'

export async function duplicateProductIntoDraftAction(
  data: TDuplicateProductIntoDraftData,
) {
  const result = await duplicateProductIntoDraft(data)

  if (result.success) {
    // To solve the issue "not product found" when switching from published mode to draft mode, get the duplicated product data to add it into product draft cache
    await queryProduct({
      slug: result.product.slug,
      type: 'draft',
      groupId: data.productGroupId,
    })

    updateTag('products-props-draft')
    updateTag('products-draft-list')
  }

  return result
}
