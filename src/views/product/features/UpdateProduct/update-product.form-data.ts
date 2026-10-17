import {
  type BuildUpdateProductFormHelperProps,
  type ProductFormT,
  type ProductSchemaT,
  type TProductStatus,
  cleanPrices,
  getEffectivePrices,
  getPricesLeafs,
  NO_ID,
} from '../../shared'

import { appendIfDefined } from '@/helpers/utils'

type BuildUpdateProductFormDataProps = {
  values: ProductSchemaT
  userId: string
  meta: TProductStatus
  productId: string
  productGroupId: string
  form: ProductFormT
  brandId?: string
} & BuildUpdateProductFormHelperProps

export function buildUpdateProductFormData({
  initialValues,
  values,
  userId,
  meta,
  productId,
  productGroupId,
  form,
  brandId,
  categoriesWithParentMap,
  groupedFeaturesSorted,
}: BuildUpdateProductFormDataProps): FormData {
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

  // Always sent
  appendIfDefined(fd, 'id', productId)
  appendIfDefined(fd, 'product_group_id', productGroupId)
  appendIfDefined(fd, 'author_id', userId)
  appendIfDefined(fd, 'status', meta)
  if (meta === 'draft') appendIfDefined(fd, 'has_draft', true)
  if (meta === 'published') appendIfDefined(fd, 'is_published', true)

  // Required
  appendIfDefined(fd, 'title', title)
  appendIfDefined(fd, 'slug', slug)

  // Descriptions
  if (short_description.json)
    appendIfDefined(fd, 'short_description_json', short_description.json)
  if (short_description.html)
    appendIfDefined(fd, 'short_description_html', short_description.html)
  if (short_description.text)
    appendIfDefined(fd, 'short_description_text', short_description.text)
  if (description.json)
    appendIfDefined(fd, 'description_json', description.json)
  if (description.html)
    appendIfDefined(fd, 'description_html', description.html)
  if (description.text)
    appendIfDefined(fd, 'description_text', description.text)

  // Brand
  if (brandId) appendIfDefined(fd, 'brand_id', brandId)

  // Categories (IDs only)
  if (categories) {
    appendIfDefined(
      fd,
      'categories',
      categories.map(c => c.id),
    )
  }

  // Media
  appendIfDefined(fd, 'thumbnail_image_src', thumbnail_image?.src)
  appendIfDefined(fd, 'thumbnail_image_alt', thumbnail_image?.alt)
  if (images) appendIfDefined(fd, 'images', images)

  // Pricing
  appendIfDefined(fd, 'currency', pricing.currency)
  if (pricing.prices) {
    const prices = cleanPrices(pricing.prices)
    appendIfDefined(fd, 'prices', prices)

    if (prices.length) {
      const effective = getEffectivePrices(prices)
      appendIfDefined(fd, 'min_effective_price', effective.min)
      appendIfDefined(fd, 'max_effective_price', effective.max)
    }
  }

  // Inventory
  if (inventory && pricing.prices) {
    const leafs = getPricesLeafs(pricing.prices)
    const leafById = new Map(leafs.map(l => [l.id, l]))
    const inventoryWithNames = []
    for (let i = 0; i < inventory.length; i++) {
      const inv = inventory[i]
      inventoryWithNames.push({
        ...inv,
        fullName: leafById.get(inv.id)?.fullName ?? '',
        price: leafById.get(inv.id)?.price ?? 0,
      })
    }
    appendIfDefined(fd, 'inventory', inventoryWithNames)
  }

  // Shipping
  appendIfDefined(fd, 'weight', shipping.weight)
  appendIfDefined(fd, 'weight_unit', shipping.weight_unit)
  appendIfDefined(fd, 'dimensions_length', shipping.dimensions.length)
  appendIfDefined(fd, 'dimensions_width', shipping.dimensions.width)
  appendIfDefined(fd, 'dimensions_height', shipping.dimensions.height)
  appendIfDefined(fd, 'dimensions_unit', shipping.dimensions.unit)
  appendIfDefined(fd, 'shipping_class', shipping.shipping_class)

  // Linked products
  appendIfDefined(fd, 'upsells', linked_products.upsells)
  appendIfDefined(fd, 'cross_sells', linked_products.cross_sells)
  appendIfDefined(fd, 'related', linked_products.related)

  // Features
  if (features) {
    const finalFeatures = structuredClone(features)

    const uniqueCategoriesId = [
      ...new Set(
        (categories || initialValues?.categories || [])
          .map(cat => cat.id)
          .flatMap(id => categoriesWithParentMap?.get(id)),
      ),
    ]

    const flatedFeaturesIds = groupedFeaturesSorted?.flatMap(group => {
      const id = group[0]
      const features = group[1].features

      if (uniqueCategoriesId?.includes(id) || id === NO_ID) {
        return features.map(({ id }) => id)
      }
    })

    // Change orphan features values to undefined (created by deselected categories), because their values exist in the submitted values
    const filteredActiveFeatures = finalFeatures?.map(f =>
      flatedFeaturesIds?.includes(f?.feature_id) ? f : undefined,
    )
    form.setFieldValue('features', filteredActiveFeatures)

    const filteredFeatures = filteredActiveFeatures.filter(Boolean)
    appendIfDefined(fd, 'features', filteredFeatures)
  }

  // Advanced
  appendIfDefined(fd, 'purchase_note', advanced.purchase_note)
  appendIfDefined(fd, 'enable_reviews', advanced.enable_reviews)

  return fd
}
