import {
  type ProductSchemaT,
  type TProductLookupDataWithIdCategoriesWithTitle,
} from '../../shared'

/**
 * - title & slug: Always populated
 * - Draft mode: Populate ALL fields with DB values
 * - Published mode: Set optional fields to null (three-state update)
 */
export function createUpdateProductDefaults(
  product: TProductLookupDataWithIdCategoriesWithTitle,
  isDraftMode: boolean,
  initialFeatures: ProductSchemaT['features'],
): ProductSchemaT {
  const v = isDraftMode ? (val: unknown) => val : () => null

  return {
    title: product.title ?? '',
    slug: product.slug ?? '',
    short_description: {
      json: v(
        product.short_description?.json,
      ) as ProductSchemaT['short_description']['json'],
      html: v(
        product.short_description?.html,
      ) as ProductSchemaT['short_description']['html'],
      text: v(
        product.short_description?.text,
      ) as ProductSchemaT['short_description']['text'],
    },
    description: {
      json: v(
        product.description?.json,
      ) as ProductSchemaT['description']['json'],
      html: v(
        product.description?.html,
      ) as ProductSchemaT['description']['html'],
      text: v(
        product.description?.text,
      ) as ProductSchemaT['description']['text'],
    },
    brand_name: v(product.brand_name) as ProductSchemaT['brand_name'],
    categories: v(product.categories) as ProductSchemaT['categories'],
    thumbnail_image: product.thumbnail_image ?? { src: null, alt: null },
    images: v(product.images) as ProductSchemaT['images'],
    pricing: {
      currency: product.pricing?.currency,
      prices: product.pricing?.prices,
    },
    inventory: product.inventory,
    shipping: {
      weight: v(
        product.shipping?.weight,
      ) as ProductSchemaT['shipping']['weight'],
      weight_unit: v(
        product.shipping?.weight_unit,
      ) as ProductSchemaT['shipping']['weight_unit'],
      dimensions: {
        length: v(product.shipping?.dimensions?.length) as number | null,
        width: v(product.shipping?.dimensions?.width) as number | null,
        height: v(product.shipping?.dimensions?.height) as number | null,
        unit: v(product.shipping?.dimensions?.unit) as string | null,
      },
      shipping_class: v(
        product.shipping?.shipping_class,
      ) as ProductSchemaT['shipping']['shipping_class'],
    },
    linked_products: {
      upsells: v(
        product.linked_products?.upsells,
      ) as ProductSchemaT['linked_products']['upsells'],
      cross_sells: v(
        product.linked_products?.cross_sells,
      ) as ProductSchemaT['linked_products']['cross_sells'],
      related: v(
        product.linked_products?.related,
      ) as ProductSchemaT['linked_products']['related'],
    },
    features: initialFeatures,
    advanced: {
      purchase_note: v(
        product.advanced?.purchase_note,
      ) as ProductSchemaT['advanced']['purchase_note'],
      enable_reviews: v(
        product.advanced?.enable_reviews,
      ) as ProductSchemaT['advanced']['enable_reviews'],
    },
  }
}
