'use server'

import { revalidatePath, revalidateTag, updateTag } from 'next/cache'

import {
  type TUpdateProductData,
  deleteProductAction,
  setPublishedSlugCache,
} from '../../shared'

import { updateProduct } from './update-product.db'
import { parseFormDataByKey, removeNullByRecursive } from '@/helpers/utils'

type UpdateProductActionType = {
  formData: FormData
  currentSlug: string
  isPublishedOfDraftedProduct: boolean
}

export async function updateProductAction({
  formData,
  currentSlug,
  isPublishedOfDraftedProduct,
}: UpdateProductActionType) {
  const rawData: TUpdateProductData = {
    id: parseFormDataByKey(formData, 'id'),
    product_group_id: parseFormDataByKey(formData, 'product_group_id'),
    title: parseFormDataByKey(formData, 'title'),
    slug: parseFormDataByKey(formData, 'slug'),
    short_description: {
      json: JSON.parse(formData.get('short_description_json') as string),
      html: formData.get('short_description_html') as string,
      text: formData.get('short_description_text') as string,
    },
    description: {
      json: JSON.parse(formData.get('description_json') as string),
      html: formData.get('description_html') as string,
      text: formData.get('description_text') as string,
    },
    author_id: parseFormDataByKey(formData, 'author_id'),
    status: parseFormDataByKey(formData, 'status'),
    brand_id: parseFormDataByKey(formData, 'brand_id'),
    categories: parseFormDataByKey(formData, 'categories'),
    thumbnail_image: {
      src: parseFormDataByKey(formData, 'thumbnail_image_src'),
      alt: parseFormDataByKey(formData, 'thumbnail_image_alt'),
    },
    images: parseFormDataByKey(formData, 'images'),
    has_draft: parseFormDataByKey(formData, 'has_draft'),
    is_published: parseFormDataByKey(formData, 'is_published'),
    pricing: {
      currency: parseFormDataByKey(formData, 'pricing_currency'),
      prices: parseFormDataByKey(formData, 'prices'),
      min_effective_price: parseFormDataByKey(formData, 'min_effective_price'),
      max_effective_price: parseFormDataByKey(formData, 'max_effective_price'),
    },
    inventory: parseFormDataByKey(formData, 'inventory'),
    shipping: {
      weight: parseFormDataByKey(formData, 'shipping_weight'),
      weight_unit: parseFormDataByKey(formData, 'shipping_weight_unit'),
      dimensions: {
        length: parseFormDataByKey(formData, 'shipping_dimensions_length'),
        width: parseFormDataByKey(formData, 'shipping_dimensions_width'),
        height: parseFormDataByKey(formData, 'shipping_dimensions_height'),
        unit: parseFormDataByKey(formData, 'shipping_dimensions_unit'),
      },
      shipping_class: parseFormDataByKey(formData, 'shipping_shipping_class'),
    },
    linked_products: {
      upsells: parseFormDataByKey(formData, 'linked_products_upsells'),
      cross_sells: parseFormDataByKey(formData, 'linked_products_cross_sells'),
      related: parseFormDataByKey(formData, 'linked_products_related'),
    },

    features: parseFormDataByKey(formData, 'features'),
    advanced: {
      purchase_note: parseFormDataByKey(formData, 'advanced_purchase_note'),
      enable_reviews: parseFormDataByKey(formData, 'advanced_enable_reviews'),
      average_rating: formData.get('IGNORE') as string as unknown as number,
      review_count: formData.get('IGNORE') as string as unknown as number,
    },
  }

  const data = removeNullByRecursive(rawData)

  if (isPublishedOfDraftedProduct) {
    data.has_draft = false
  }

  const result = await updateProduct(data)

  if (result.success) {
    // Delete draft on switching to published mode
    if (isPublishedOfDraftedProduct) {
      const { id, product_group_id, title } = data
      await deleteProductAction({
        id,
        productGroupId: product_group_id!,
        title: title || 'Unknown Title',
        hasDraft: true,
        onlyDeleteDraft: true,
      })

      if (result.product.slug) {
        setPublishedSlugCache(data.product_group_id!, result.product.slug)
      }
    }

    if (data.status === 'draft') {
      // Don't need to update product draft cache like product published cache
      updateTag('product-draft-' + result.product.id)
      updateTag('products-props-draft')
      updateTag('products-draft-list')
    } else {
      // If the slug is updated, don't need to update product published cache, it must shows stale data until fresh data be ready, otherwise the cache need to update to show fresh data immediately
      if (currentSlug === result.product.slug) {
        updateTag('product-' + result.product.id)
      } else {
        revalidatePath(
          '/dashboard/products/all-products/' + result.product.slug,
        )

        setPublishedSlugCache(data.product_group_id!, result.product.slug)
      }
      updateTag('products-props')
      updateTag('products-list')
      revalidateTag('products-for-linking-list', 'max')

      if (result.affectedGuaranteeIds.length) {
        for (let i = 0; i < result.affectedGuaranteeIds.length; i++) {
          const id = result.affectedGuaranteeIds[i]
          updateTag('guarantee-' + id)
        }

        updateTag('guarantees-list')
      }
    }
  }

  return result
}
