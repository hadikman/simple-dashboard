import { ObjectId } from 'mongodb'

import type { Prettify, WithId } from '@/helpers/ts-utils'

// Guarantee interfaces & types
export type TGuaranteeStatus = 'active' | 'inactive'

export interface IGuaranteeTargetItem {
  product_group_id: string
  product_id: ObjectId
  product_name: string
  category_id: ObjectId | null
  category_name: string
  price_id: string
  price_name: string
}

interface IGuaranteeExtraDuration {
  id: string
  duration: string
  price: number
}

export interface IGuaranteeDocument {
  schema_version: number
  name: string
  slug: string
  brand_id: ObjectId | null
  brand_name: string | null
  description: string
  duration: string
  extra_price: number
  status: TGuaranteeStatus
  target_items: IGuaranteeTargetItem[]
  extra_duration: IGuaranteeExtraDuration[]
  created_at: Date
  updated_at: Date | null
}

export type IGuaranteeTargetItemWithId = Prettify<
  Omit<IGuaranteeTargetItem, 'product_id' | 'category_id'> & {
    product_id: string
    category_id: string | null
  }
>

export interface IGuaranteeLookupDocument {
  _id: ObjectId
  schema_version: number
  name: string
  slug: string
  brand_id: ObjectId | null
  brand_name: string | null
  description: string
  duration: string
  extra_price: number
  status: TGuaranteeStatus
  target_items: IGuaranteeTargetItem[]
  extra_duration: IGuaranteeExtraDuration[]
  created_at: Date
  updated_at: Date | null
}

type TRemovedUnchangeableGuaranteeProps = Omit<
  IGuaranteeDocument,
  'schema_version' | 'brand_id' | 'target_items'
>

export type TGuaranteeLookupDataWithId = Prettify<
  Omit<TRemovedUnchangeableGuaranteeProps, '_id'> & {
    id: string
    brand_id: string | null
    target_items: IGuaranteeTargetItemWithId[]
  }
>

export type TGuaranteeData = Prettify<
  Omit<
    TRemovedUnchangeableGuaranteeProps,
    '_id' | 'created_at' | 'updated_at'
  > & {
    brand_id: string | null
    target_items: IGuaranteeTargetItemWithId[]
  }
>

export type TGuaranteeLookupResponse = TGuaranteeLookupDataWithId

export type TGuaranteeErrorCode =
  | 'GUARANTEE_EXISTS'
  | 'CREATE_FAILURE'
  | 'EMPTY_GUARANTEES'
  | 'DUPLICATE_PROP'
  | 'DELETE_FAILURE'
  | 'NOT_FOUND_GUARANTEES_PROPS'
  | 'NOT_FOUND_GUARANTEE'
  | 'UPDATE_FAILURE'

export interface IGuaranteeValidation {
  general?: string | undefined
  code?: TGuaranteeErrorCode | undefined
}

export type TGuaranteeResponse = WithId<IGuaranteeDocument>

export type TLockedPrice = {
  guarantee_id: string
  guarantee_name: string
}

export type TLockedPricesMap = Record<string, TLockedPrice>

// New Guarantee
export type TAddGuaranteeResponse =
  | {
      success: true
      guarantee: { id: string }
    }
  | {
      success: false
      errors: IGuaranteeValidation
    }

// Get Guarantees
export type TGetGuaranteesResponse =
  | {
      success: true
      guarantees: TGuaranteeLookupResponse[]
    }
  | {
      success: false
      errors: IGuaranteeValidation
    }

// Delete Guarantee
export type TDeleteGuaranteeData = { id: string; name: string }

export type TDeleteGuaranteeResponse =
  | {
      success: true
      guarantee: { name: string }
      productsId: { id: string }[]
      productsDraftId: { id: string }[]
    }
  | {
      success: false
      errors: IGuaranteeValidation
    }

// Get Guarantees Props
export type TGetGuaranteesPropsResponse<T> =
  | {
      success: true
      guarantees: WithId<T>[]
    }
  | {
      success: false
      errors: IGuaranteeValidation
    }

// Get Guarantee by Slug
export type TQueryGuaranteeData = { slug: string }

export type TGetGuaranteeLookupResponse =
  | {
      success: true
      guarantee: TGuaranteeLookupResponse
    }
  | {
      success: false
      errors: IGuaranteeValidation
    }

// Update Guarantee
export type TUpdateGuaranteeData = WithId<Partial<TGuaranteeData>>

export type TUpdateGuaranteeResponse =
  | {
      success: true
      guarantee: { id: string; slug: string }
      productsId: { id: string }[]
    }
  | {
      success: false
      errors: IGuaranteeValidation
    }

// Check Duplicate Guarantee
export type TQueryDuplicateGuaranteePropData = {
  key: keyof Prettify<Omit<IGuaranteeDocument, 'schema_version'>>
  value: string
}

export type TCheckDuplicateGuaranteeResponse =
  | {
      isDuplicate: true
      message: IGuaranteeValidation
    }
  | {
      isDuplicate: false
      message: null
    }
