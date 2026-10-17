import {
  type ProductSchemaT,
  type TProductStatus,
  cleanPrices,
  getEffectivePrices,
  getPricesLeafs,
} from '../../shared'

import { appendIfValidNumber, getFilename } from '@/helpers/utils'

type BuildAddProductFormDataProps = {
  values: ProductSchemaT
  userId: string
  meta: TProductStatus
  suggestionSlug: string
  brandId?: string
}

// CREATE: Skip null/empty optional fields entirely
export function buildAddProductFormData({
  values,
  userId,
  meta,
  suggestionSlug,
  brandId,
}: BuildAddProductFormDataProps): FormData {
  const fd = new FormData()
  const {
    title,
    slug,
    short_description,
    description,
    categories,
    thumbnail_image,
    images,
    pricing,
    inventory,
    shipping,
    linked_products,
    features,
    advanced,
  } = values

  // Core
  fd.append('title', title)
  fd.append('slug', slug || suggestionSlug)
  fd.append('author_id', userId)
  fd.append('status', meta)
  if (meta === 'draft') fd.append('has_draft', 'true')
  if (meta === 'published') fd.append('is_published', 'true')

  // Descriptions
  if (short_description.json)
    fd.append('short_description_json', JSON.stringify(short_description.json))
  if (short_description.html)
    fd.append('short_description_html', short_description.html)
  if (short_description.text)
    fd.append('short_description_text', short_description.text)
  if (description.json)
    fd.append('description_json', JSON.stringify(description.json))
  if (description.html) fd.append('description_html', description.html)
  if (description.text) fd.append('description_text', description.text)

  // Brand
  if (brandId) fd.append('brand_id', brandId)

  // Categories (send only IDs to backend)
  if (categories?.length) {
    fd.append('categories', JSON.stringify(categories.map(c => c.id)))
  }

  // Thumbnail
  if (thumbnail_image?.src) {
    fd.append('thumbnail_image_src', thumbnail_image.src)
    fd.append('thumbnail_image_alt', getFilename(thumbnail_image.src))
  }

  // Images
  if (images?.length) fd.append('images', JSON.stringify(images))

  // Pricing
  if (pricing.currency) fd.append('currency', pricing.currency)
  if (pricing.prices?.length) {
    const prices = cleanPrices(pricing.prices)
    fd.append('prices', JSON.stringify(prices))

    if (prices.length) {
      const effective = getEffectivePrices(prices)
      appendIfValidNumber(fd, 'min_effective_price', effective.min)
      appendIfValidNumber(fd, 'max_effective_price', effective.max)
    }
  }

  // Inventory
  if (inventory?.length && pricing.prices) {
    const leafs = getPricesLeafs(pricing.prices)
    const leafById = new Map(leafs.map(l => [l.id, l]))
    const inventoryWithNames = inventory.map(inv => ({
      ...inv,
      fullName: leafById.get(inv.id)?.fullName ?? '',
      price: leafById.get(inv.id)?.price ?? 0,
    }))
    fd.append('inventory', JSON.stringify(inventoryWithNames))
  }

  // Shipping
  appendIfValidNumber(fd, 'weight', shipping.weight)
  if (shipping.weight_unit) fd.append('weight_unit', shipping.weight_unit)
  appendIfValidNumber(fd, 'dimensions_length', shipping.dimensions.length)
  appendIfValidNumber(fd, 'dimensions_width', shipping.dimensions.width)
  appendIfValidNumber(fd, 'dimensions_height', shipping.dimensions.height)
  if (shipping.dimensions.unit)
    fd.append('dimensions_unit', shipping.dimensions.unit)
  if (shipping.shipping_class)
    fd.append('shipping_class', shipping.shipping_class)

  // Linked products (send full objects)
  if (linked_products.upsells?.length)
    fd.append('upsells', JSON.stringify(linked_products.upsells))
  if (linked_products.cross_sells?.length)
    fd.append('cross_sells', JSON.stringify(linked_products.cross_sells))
  if (linked_products.related?.length)
    fd.append('related', JSON.stringify(linked_products.related))

  // Features (already filtered upstream)
  if (features?.length) {
    const filtered = features.filter(Boolean)
    if (filtered.length) fd.append('features', JSON.stringify(filtered))
  }

  // Advanced
  if (advanced.purchase_note) fd.append('purchase_note', advanced.purchase_note)
  fd.append('enable_reviews', String(advanced.enable_reviews))

  return fd
}
