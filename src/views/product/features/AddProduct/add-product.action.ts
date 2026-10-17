'use server'

import { revalidateTag, updateTag } from 'next/cache'

import {
  type TProductData,
  type TProductStatus,
  setPublishedSlugCache,
} from '../../shared'

import { addProduct } from './add-product.db'

export async function addProductAction(formData: FormData) {
  const rawData: TProductData = {
    product_group_id: formData.get('product_group_id') as string, // Used for when update product needs to create a duplicate of the product by calling addProductAction at draft mode (product.tsx)
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    short_description: {
      json: JSON.parse(formData.get('short_description_json') as string) || {},
      html: (formData.get('short_description_html') as string) || '',
      text: (formData.get('short_description_text') as string) || '',
    },
    description: {
      json: JSON.parse(formData.get('description_json') as string) || {},
      html: (formData.get('description_html') as string) || '',
      text: (formData.get('description_text') as string) || '',
    },
    author_id: formData.get('author_id') as string,
    author_name: (formData.get('author_name') as string) || '',
    status: formData.get('status') as TProductStatus,
    brand_id: (formData.get('brand_id') as string) ?? null,
    brand_name: (formData.get('brand_name') as string) || '',
    categories: JSON.parse((formData.get('categories') as string) || '[]'),
    thumbnail_image: {
      src: (formData.get('thumbnail_image_src') as string) || '',
      alt: (formData.get('thumbnail_image_alt') as string) || '',
    },
    images: JSON.parse((formData.get('images') as string) || '[]'),
    has_draft: formData.get('has_draft') === 'true',
    is_published: formData.get('is_published') === 'true',
    pricing: {
      currency: (formData.get('currency') as string) || '',
      prices: JSON.parse((formData.get('prices') as string) || '[]'),
      min_effective_price: Number(formData.get('min_effective_price')) ?? 0,
      max_effective_price: Number(formData.get('max_effective_price')) ?? 0,
    },
    inventory: JSON.parse((formData.get('inventory') as string) || '[]'),
    shipping: {
      weight: Number(formData.get('weight')) ?? 0,
      weight_unit: (formData.get('weight_unit') as string) || '',
      dimensions: {
        length: Number(formData.get('dimensions_length')) ?? 0,
        width: Number(formData.get('dimensions_width')) ?? 0,
        height: Number(formData.get('dimensions_height')) ?? 0,
        unit: (formData.get('dimensions_unit') as string) ?? '',
      },
      shipping_class: (formData.get('shipping_class') as string) || '',
    },
    linked_products: {
      upsells: JSON.parse((formData.get('upsells') as string) || '[]'),
      cross_sells: JSON.parse((formData.get('cross_sells') as string) || '[]'),
      related: JSON.parse((formData.get('related') as string) || '[]'),
    },
    features: JSON.parse((formData.get('features') as string) || '[]'),
    advanced: {
      purchase_note: (formData.get('purchase_note') as string) || '',
      enable_reviews: formData.get('enable_reviews') === 'true',
      average_rating: 0.0,
      review_count: 0.0,
    },
    stats: { total_sales: 0, total_revenue: 0 },
  }

  const result = await addProduct(rawData)

  if (result.success) {
    if (rawData.status === 'draft') {
      updateTag('products-draft-list')
    } else {
      setPublishedSlugCache(result.product.product_group_id, rawData.slug)
    }

    updateTag('products-list')
    revalidateTag('products-for-linking-list', 'max')
  }

  return result
}
