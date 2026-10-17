'use client'

import { z } from 'zod'

import type { Prettify } from '@/helpers/ts-utils'

import { type FlatCategoryNode } from '@/views/category'

import { type TFeatureLookupResponse } from '@/views/features'

import { type TProductLookupDataWithId } from './'

import { useAppForm } from '@/hooks/create-react-form-hook'

const SILENT_ERROR = ''
const EMPTY_EDITOR_VALUE = { json: null, html: null, text: null }
const STOCK_STATUS = ['available', 'out_of_stock', 'preorder'] as const

// ─── Shared schemas ──────────────────────────────────────────
const DescriptionSchema = z.object({
  json: z.record(z.string(), z.unknown()).nullish(),
  html: z.string().trim().nullish(),
  text: z.string().trim().nullish(),
})

// It should be the same as type of ComboboxItemType in ComboboxField
const CategoryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
})

const ImageSchema = z.object({
  src: z.string().nullish(),
  alt: z.string().nullish(),
})

const ImagesSchema = z.array(ImageSchema)

// ─── Pricing ─────────────────────────────────────────────────
export const PricePropSchema = z.object({
  title: z.string().trim().min(1, SILENT_ERROR),
  values: z.string().trim().min(1, SILENT_ERROR),
})

const PriceSchema = z.object({
  id: z.string(),
  parent_id: z.string(),
  offer_id: z.string().nullable(),
  guarantee_id: z.string().nullable(),
  name: z.string().trim(),
  offer_name: z.string(),
  guarantee_name: z.string().nullable(),
  depth: z.number(),
  price: z.number().nonnegative(SILENT_ERROR),
  offer_discount: z.number(),
  discount: z.number().nonnegative(SILENT_ERROR),
  offer: z.string().trim(),
  props: z.array(PricePropSchema),
})

const PricesSchema = z
  .array(PriceSchema)
  .superRefine((items, ctx) => {
    if (items.length <= 1) return
    for (let i = 0; i < items.length; i++) {
      if (!items[i].name || items[i].name.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          message: SILENT_ERROR,
          path: [i, 'name'],
        })
      }
    }
  })
  .nullish()

const PricingSchema = z.object({
  currency: z.string().nullish(),
  prices: PricesSchema,
})

// ─── Inventory ───────────────────────────────────────────────
function optionalRegexString(regex: RegExp, message: string) {
  return z.union([
    z.string().trim().regex(regex, message).nullable(),
    z.literal(''),
  ])
}

const InventoryItemSchema = z
  .object({
    id: z.string(),
    sku: z.string().trim(),
    product_id: z.string().trim(),
    isbn: optionalRegexString(
      /^(?:\d{9}[\dX]|\d{13})$/,
      'Must be 10 or 13 digits',
    ),
    ean: optionalRegexString(/^\d{8}$|^\d{13}$/, 'Must be 8 or 13 digits'),
    gtin: optionalRegexString(
      /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/,
      'Must be 8, 12, 13, or 14 digits',
    ),
    stock_quantity: z.number(),
    stock_status: z.enum(STOCK_STATUS),
    low_stock_threshold: z.number(),
    max_purchase_per_order: z.number(),
  })
  .superRefine((data, ctx) => {
    const {
      stock_quantity,
      stock_status,
      low_stock_threshold,
      max_purchase_per_order,
    } = data

    if (stock_status === 'out_of_stock' && stock_quantity !== 0) {
      ctx.addIssue({
        path: ['stock_quantity'],
        message: 'The value must be zero with "Product Status: Out of Stock".',
        code: 'custom',
      })
    }
    if (
      low_stock_threshold &&
      stock_quantity &&
      low_stock_threshold > stock_quantity
    ) {
      ctx.addIssue({
        path: ['low_stock_threshold'],
        message: 'The value must be lower than "Stock Quantity".',
        code: 'custom',
      })
    }
    if (
      max_purchase_per_order &&
      stock_quantity &&
      max_purchase_per_order > stock_quantity
    ) {
      ctx.addIssue({
        path: ['max_purchase_per_order'],
        message: 'The value must be lower than "Stock Quantity".',
        code: 'custom',
      })
    }
  })

const InventorySchema = z.array(InventoryItemSchema).nullish()

// ─── Shipping ────────────────────────────────────────────────
const ShippingSchema = z.object({
  weight: z.number().nullish(),
  weight_unit: z.string().trim().nullish(),
  dimensions: z.object({
    length: z.number().nullish(),
    width: z.number().nullish(),
    height: z.number().nullish(),
    unit: z.string().trim().nullish(),
  }),
  shipping_class: z.string().trim().nullish(),
})

// ─── Linked products ─────────────────────────────────────────
const LinkedProductItemSchema = z.object({
  id: z.string(),
  title: z.string(),
})

const LinkedProductsSchema = z.object({
  upsells: z.array(LinkedProductItemSchema).nullish(),
  cross_sells: z.array(LinkedProductItemSchema).nullish(),
  related: z.array(LinkedProductItemSchema).nullish(),
})

// ─── Features ────────────────────────────────────────────────
export const FeaturesSchema = z
  .array(
    z
      .object({
        feature_id: z.string(),
        value_id: z.number(),
        value: z.string(),
      })
      .nullish(),
  )
  .nullish()

// ─── Advanced ────────────────────────────────────────────────
const AdvancedSchema = z.object({
  purchase_note: z.string().trim().nullish(),
  enable_reviews: z.boolean().nullish(),
})

// ─── Single schema for both Create and Update ────────────────
export const ProductSchema = z.object({
  title: z.string().trim().min(1, 'The value is required.'),
  slug: z.string().trim().nullish(),
  short_description: DescriptionSchema,
  description: DescriptionSchema,
  brand_name: z.string().trim().nullish(),
  categories: z.array(CategoryItemSchema).nullish(),
  thumbnail_image: ImageSchema.nullish(),
  images: ImagesSchema.nullish(),
  pricing: PricingSchema,
  inventory: InventorySchema,
  shipping: ShippingSchema,
  linked_products: LinkedProductsSchema,
  features: FeaturesSchema,
  advanced: AdvancedSchema,
})

export type ProductSchemaT = z.input<typeof ProductSchema>

function _getProductFormType() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAppForm({
    defaultValues: {} as ProductSchemaT,
    validators: { onSubmit: ProductSchema },
  })
}
export type ProductFormT = ReturnType<typeof _getProductFormType>

// ─── Derived types ───────────────────────────────────────────
export type Prices = z.infer<typeof PricesSchema>
export type PriceItem = z.infer<typeof PriceSchema>
export type InventoryItem = z.infer<typeof InventoryItemSchema>

// ─── Inventory form field types ───────────────────────────────────────────
export type PriceLeaf = {
  id: string
  fullName: string
  price: number
}

// Matching title with ComboboxItemType in ComboboxField
export type TProductLookupDataWithIdCategoriesWithTitle = Partial<
  Omit<TProductLookupDataWithId, 'categories'> & {
    categories: ProductSchemaT['categories']
  }
>

// Matching title with ComboboxItemType in ComboboxField
export type FlatCategoryNodeWithTitle = Prettify<
  Omit<
    FlatCategoryNode,
    'name' | 'children' | 'isLastChild' | 'ancestorIds'
  > & {
    title: string
  }
>

// Extactly the same as type of ComboboxItemType in ComboboxField
export type ComboboxItemType = {
  id: string
  title: string
}

export const EMPTY_EDITOR = EMPTY_EDITOR_VALUE

// ─── Helper values for update product ───────────────────────────────────────────
export type BuildUpdateProductFormHelperProps = {
  initialValues: TProductLookupDataWithIdCategoriesWithTitle
  categoriesWithParentMap: Map<string, string[]>
  featuresIdxsMap: Map<string, number>
  groupedFeaturesSorted: [
    string,
    {
      category: string
      features: TFeatureLookupResponse[]
    },
  ][]
}
