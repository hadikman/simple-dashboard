import { type ProductSchemaT, EMPTY_EDITOR } from '../../shared'

export function createAddProductDefaults(): ProductSchemaT {
  return {
    title: '',
    slug: '',
    short_description: EMPTY_EDITOR,
    description: EMPTY_EDITOR,
    brand_name: null,
    categories: [],
    thumbnail_image: { src: null, alt: null },
    images: [],
    pricing: { currency: null, prices: null },
    inventory: null,
    shipping: {
      weight: 0,
      weight_unit: null,
      dimensions: { length: 0, width: 0, height: 0, unit: null },
      shipping_class: null,
    },
    linked_products: { upsells: null, cross_sells: null, related: null },
    features: null,
    advanced: { purchase_note: null, enable_reviews: true },
  }
}
