import { ObjectId } from 'mongodb'

import type {
  PartialByRecursive,
  Prettify,
  ProjectionKeys,
  WithId,
} from '@/helpers/ts-utils'

// Product interfaces & types
export interface IDescription {
  json: Record<string, unknown>
  html: string
  text: string
}
export type TProductShortDescription = IDescription
export type TProductDescription = IDescription

export type TProductStockStatus = 'available' | 'out_of_stock' | 'preorder'
export type TProductStatus = 'draft' | 'published'

export interface IProductImage {
  src: string
  alt: string
}

export interface IProductPriceProp {
  title: string
  values: string
}
export interface IProductPrice {
  id: string
  parent_id: string
  offer_id: ObjectId | null
  guarantee_id: ObjectId | null
  name: string
  offer_name: string
  guarantee_name: string
  depth: number
  price: number
  discount: number
  offer_discount: number
  offer: string
  props: IProductPriceProp[]
}
export interface IProductPricing {
  currency: string
  prices: IProductPrice[]
  min_effective_price: number
  max_effective_price: number
}

export interface IProductInventory {
  id: string
  sku: string
  product_id: string
  isbn: string
  ean: string
  gtin: string
  stock_quantity: number
  stock_status: TProductStockStatus
  low_stock_threshold: number
  max_purchase_per_order: number
}

export interface IProductDimensions {
  length: number
  width: number
  height: number
  unit: string
}

export interface IProductShipping {
  weight: number
  weight_unit: string
  dimensions: IProductDimensions
  shipping_class: string
}

export interface ILinkedProducts {
  upsells: ObjectId[]
  cross_sells: ObjectId[]
  related: ObjectId[]
}

export interface IProductFeature {
  feature_id: ObjectId | null
  value_id: number | null
}

export interface IProductAdvanced {
  purchase_note: string
  enable_reviews: boolean
  average_rating: number
  review_count: number
}

export interface IProductStats {
  total_sales: number
  total_revenue: number
}

export interface IProductDocument {
  schema_version: number
  product_group_id: string
  title: string
  slug: string
  short_description: TProductShortDescription
  description: TProductDescription
  author_id: ObjectId
  author_name: string
  status: TProductStatus
  brand_id: ObjectId | null
  brand_name: string
  categories: ObjectId[]
  thumbnail_image: IProductImage
  images: IProductImage[]
  has_draft: boolean
  is_published: boolean
  pricing: IProductPricing
  inventory: IProductInventory[]
  shipping: IProductShipping
  linked_products: ILinkedProducts
  features: IProductFeature[]
  advanced: IProductAdvanced
  stats: IProductStats
  published_at: Date | null
  created_at: Date
  updated_at: Date | null
}

export interface IProductCategoriesLookup {
  _id: ObjectId
  name: string
}

export interface ILinkedProductLookup {
  _id: ObjectId
  product_group_id: string
  title: string
}
export interface ILinkedProductsLookup {
  upsells: ILinkedProductLookup[]
  cross_sells: ILinkedProductLookup[]
  related: ILinkedProductLookup[]
}

export interface IProductFeatureLookup {
  feature_id: ObjectId
  name: string
  value_id: number
  value_name: string
}

export interface IProductLookupDocument {
  _id: ObjectId
  product_group_id: string
  schema_version: number
  title: string
  slug: string
  short_description: TProductShortDescription
  description: TProductDescription
  author_id: ObjectId
  author_name: string
  status: TProductStatus
  brand_id: ObjectId | null
  brand_name: string
  categories: IProductCategoriesLookup[]
  thumbnail_image: IProductImage
  images: IProductImage[]
  has_draft: boolean
  is_published: boolean
  pricing: IProductPricing
  inventory: IProductInventory[]
  shipping: IProductShipping
  linked_products: ILinkedProductsLookup
  features: IProductFeatureLookup[]
  advanced: IProductAdvanced
  stats: IProductStats
  published_at: Date | null
  created_at: Date
  updated_at: Date | null
}

export type TRemovedUnchangeableProductsProps = Omit<
  IProductDocument,
  | 'schema_version'
  | 'author_id'
  | 'brand_id'
  | 'published_at'
  | 'created_at'
  | 'updated_at'
>

export type TProductData = Prettify<
  TRemovedUnchangeableProductsProps & {
    author_id: string
    brand_id: string | null
  }
>

type TProductPriceWithId = Omit<IProductPrice, 'offer_id' | 'guarantee_id'> & {
  offer_id: string | null
  guarantee_id: string | null
}

type TProductPricingWithId = Omit<IProductPricing, 'prices'> & {
  prices: TProductPriceWithId[]
}

export type TLinkedProductLookupWithId = Prettify<
  Omit<ILinkedProductLookup, '_id'> & {
    id: string
  }
>

export type TProductLookupDataWithId = Prettify<
  Omit<
    IProductLookupDocument,
    | '_id'
    | 'schema_version'
    | 'author_id'
    | 'brand_id'
    | 'categories'
    | 'pricing'
    | 'linked_products'
    | 'features'
  > & {
    id: string
    author_id: string
    brand_id: string | null
    pricing: TProductPricingWithId
    categories: (Omit<IProductCategoriesLookup, '_id'> & { id: string })[]
    linked_products: {
      upsells: TLinkedProductLookupWithId[]
      cross_sells: TLinkedProductLookupWithId[]
      related: TLinkedProductLookupWithId[]
    }
    features: (Omit<IProductFeatureLookup, 'feature_id'> & {
      feature_id: string
    })[]
  }
>

export type TProductPropsData = Omit<
  TRemovedUnchangeableProductsProps,
  | 'id'
  | 'product_group_id'
  | 'status'
  | 'has_draft'
  | 'is_published'
  | 'categories'
  | 'linked_products'
  | 'features'
>

export type TProductLookupResponse = TProductLookupDataWithId

export type TProductsForLinkingResponse = TLinkedProductLookupWithId

export type TProductErrorCode =
  | 'DUPLICATE_SLUG'
  | 'FAILURE_DRAFT'
  | 'FAILURE'
  | 'EMPTY_PRODUCTS'
  | 'EMPTY_PRODUCTS_DRAFT'
  | 'DELETE_DRAFT_FAILURE'
  | 'DELETE_FAILURE'
  | 'NOT_FOUND_PRODUCTS_PROPS'
  | 'NOT_FOUND_PRODUCT'
  | 'DUPLICATE_PROP'
  | 'UPDATE_FAILURE'
  | 'NOT_FOUND_PRODUCT_TO_DUPLICATE'
  | 'DUPLICATE_PRODUCT_INTO_DRAFT_FAILURE'
  | 'UPDATE_PRODUCT_PROP_FAILURE'
  | 'DELETE_DRAFTS_FAILURE'
  | 'DELETE_PRODUCTS_FAILURE'
  | 'COPY_FAILURE'
export interface IProductValidation {
  general?: string | undefined
  code?: TProductErrorCode | undefined
}

// New Product
export type TAddProductResponse =
  | {
      success: true
      product: { id: string; product_group_id: string }
    }
  | {
      success: false
      errors: IProductValidation
    }

// Check Duplicate Product
export type TQueryDuplicateProductData = {
  productGroupId?: string
  slug: string
}

export type TCheckDuplicateProductResponse =
  | {
      isDuplicate: true
      message: IProductValidation
    }
  | {
      isDuplicate: false
      message: null
    }

// Get Products
export type TQueryProductsData = {
  type: TProductStatus
}

export type TGetProductsResponse =
  | {
      success: true
      products: TProductLookupResponse[]
    }
  | {
      success: false
      errors: IProductValidation
    }

// Delete Product
export type TDeleteProductData = {
  id: string
  productGroupId: string
  title: string
  hasDraft: boolean
  onlyDeleteDraft?: boolean
}

export type TDeleteProductResponse =
  | {
      success: true
      product: { id: string; title: string }
    }
  | {
      success: false
      errors: IProductValidation
    }

// Get Products Props
export type TQueryProductsPropsData<T> = {
  keys: ProjectionKeys<T>
  type?: TProductStatus
}

export type TGetProductsPropsResponse<T> =
  | {
      success: true
      products: WithId<T>[]
    }
  | {
      success: false
      errors: IProductValidation
    }

// Get Product by Slug
export type TQueryProductData = {
  slug: string
  type?: TProductStatus
  groupId?: string
}

export type TGetProductLookupResponse =
  | {
      success: true
      product: TProductLookupResponse
    }
  | {
      success: false
      errors: IProductValidation
    }

// Update Product
export type TUpdateProductData = WithId<Partial<TProductData>>

export type TUpdateProductResponse =
  | {
      success: true
      product: { id: string; slug: string }
      affectedGuaranteeIds: { id: string }[]
    }
  | {
      success: false
      errors: IProductValidation
    }

// Get Products for Linking
export type TGetProductsForLinkingResponse =
  | {
      success: true
      products: TProductsForLinkingResponse[]
    }
  | {
      success: false
      errors: IProductValidation
    }

// Duplicate Product into Draft
export type TDuplicateProductIntoDraftData = { productGroupId: string }

export type TDuplicateProductIntoDraftResponse =
  | {
      success: true
      product: { id: string; title: string; slug: string }
    }
  | {
      success: false
      errors: IProductValidation
    }

// Update Product Prop
export type TUpdateProductPropData = {
  id: string
  product_group_id: string
  status: TProductStatus
  updatePropsData: PartialByRecursive<TProductPropsData>
}

export type TUpdateProductPropDataResponse =
  | {
      success: true
      value: unknown
    }
  | {
      success: false
      errors: IProductValidation
    }

// Delete Products
export type TDeleteProductsData = {
  id: string
  productGroupId: string
  hasDraft: boolean
  isPublished?: boolean
  onlyDeleteDraft?: boolean
}[]

export type TDeleteProductsResponse =
  | {
      success: true
      deleteCount: number
    }
  | {
      success: false
      errors: IProductValidation
    }

// Copy Product
export type TCopyProductData = { id: string }

export type TCopyProductResponse =
  | {
      success: true
      product: { id: string; title: string; slug: string }
    }
  | {
      success: false
      errors: IProductValidation
    }
