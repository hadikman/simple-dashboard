import { ObjectId } from 'mongodb'

import type { Prettify, ProjectionKeys, WithId } from '@/helpers/ts-utils'

// Brand interfaces & types
export interface IBrandLogo {
  src: string
  alt: string
}

export interface IBrandStats {
  product_count: number
  total_sales: number
  average_rating: number
}

export interface IBrandDocument {
  schema_version: number
  name: string
  slug: string
  description: string
  categories: ObjectId[]
  logo: IBrandLogo
  website: string
  email: string
  phone: string
  stats: IBrandStats
  created_at: Date
  updated_at: Date | null
}

export interface IBrandCategoriesLookup {
  _id: ObjectId
  name: string
}

export interface IBrandLookupDocument {
  _id: ObjectId
  name: string
  slug: string
  description: string
  categories: IBrandCategoriesLookup[]
  logo: IBrandLogo
  website: string
  email: string
  phone: string
  stats: IBrandStats
  created_at: Date
  updated_at: Date | null
}

export type TRemovedUnchangeableBrandProps = Omit<
  IBrandDocument,
  'schema_version' | 'created_at' | 'updated_at'
>

export type TBrandData = Prettify<TRemovedUnchangeableBrandProps>

export type TBrandLookupDataWithId = Prettify<
  Omit<IBrandLookupDocument, '_id' | 'schema_version' | 'categories'> & {
    id: string
    categories: (Omit<IBrandCategoriesLookup, '_id'> & { id: string })[]
  }
>

export type TBrandLookupResponse = TBrandLookupDataWithId

export type TBrandErrorCode =
  | 'BRAND_EXISTS'
  | 'CREATE_FAILURE'
  | 'EMPTY_BRANDS'
  | 'DELETE_FAILURE'
  | 'DUPLICATE_SLUG'
  | 'NOT_FOUND_BRANDS_PROPS'
  | 'NOT_FOUND_BRAND'
  | 'UPDATE_FAILURE'

export interface IBrandValidation {
  general?: string | undefined
  code?: TBrandErrorCode | undefined
}

// Add Brand
export type TAddBrandResponse =
  | {
      success: true
      brand: { id: string }
    }
  | {
      success: false
      errors: IBrandValidation
    }

// Get Brands
export type TGetBrandsResponse =
  | {
      success: true
      brands: TBrandLookupResponse[]
    }
  | {
      success: false
      errors: IBrandValidation
    }

// Delete Brand
export type TDeleteBrandData = {
  id: string
  name: string
}

export type TDeleteBrandResponse =
  | {
      success: true
      brand: { id: string; name: string }
      modifiedProductsCount: number
      modifiedProductsDraftCount: number
    }
  | {
      success: false
      errors: IBrandValidation
    }

// Check Duplicate Brand
export type TQueryDuplicateBrandData = { slug: string }

export type TCheckDuplicateBrandResponse =
  | {
      isDuplicate: true
      message: IBrandValidation
    }
  | {
      isDuplicate: false
      message: null
    }

// Get Brands Props
export type TQueryBrandsPropsData<T> = {
  keys: ProjectionKeys<T>
}

export type TGetBrandsPropsResponse<T> =
  | {
      success: true
      brands: WithId<T>[]
    }
  | {
      success: false
      errors: IBrandValidation
    }

// Get Brand by Slug
export type TQueryBrandData = { slug: string }

export type TGetBrandLookupResponse =
  | {
      success: true
      brand: TBrandLookupResponse
    }
  | {
      success: false
      errors: IBrandValidation
    }

// Update Brand
export type TUpdateBrandData = WithId<Partial<TBrandData>>

export type TUpdateBrandResponse =
  | {
      success: true
      brand: { id: string; slug: string }
    }
  | {
      success: false
      errors: IBrandValidation
    }
