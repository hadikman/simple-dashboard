import { ObjectId } from 'mongodb'

import type { Prettify, WithId } from '@/helpers/ts-utils'

// Offer interfaces & types
export type TOfferStatus =
  'draft' | 'scheduled' | 'active' | 'expired' | 'paused'

export interface IOfferTargetItem {
  product_group_id: string
  product_id: ObjectId
  product_name: string
  category_id: ObjectId | null
  category_name: string
  price_id: string
  price_name: string
  original_price: number
  final_price: number
}

export interface IOfferDocument {
  schema_version: number
  name: string
  slug: string
  description: string
  discount: number
  offer_start: Date
  offer_end: Date
  status: TOfferStatus
  target_items: IOfferTargetItem[]
  created_at: Date
  updated_at: Date | null
}

export type IOfferTargetItemWithId = Prettify<
  Omit<IOfferTargetItem, 'product_id' | 'category_id'> & {
    product_id: string
    category_id: string | null
  }
>
export interface IOfferLookupDocument {
  _id: ObjectId
  schema_version: number
  name: string
  slug: string
  description: string
  discount: number
  offer_start: Date
  offer_end: Date
  status: TOfferStatus
  target_items: IOfferTargetItem[]
  created_at: Date
  updated_at: Date | null
}

type TRemovedUnchangeableOfferProps = Omit<
  IOfferDocument,
  'schema_version' | 'target_items'
>

export type TOfferLookupDataWithId = Prettify<
  Omit<TRemovedUnchangeableOfferProps, '_id'> & {
    id: string
    target_items: IOfferTargetItemWithId[]
  }
>

export type TOfferData = Omit<
  TRemovedUnchangeableOfferProps,
  '_id' | 'created_at' | 'updated_at'
> & {
  target_items: IOfferTargetItemWithId[]
}

export type TOfferLookupResponse = TOfferLookupDataWithId

export type TOfferErrorCode =
  | 'OFFER_EXISTS'
  | 'CREATE_FAILURE'
  | 'EMPTY_OFFERS'
  | 'DUPLICATE_PROP'
  | 'DELETE_FAILURE'
  | 'NOT_FOUND_OFFERS_PROPS'
  | 'NOT_FOUND_OFFER'
  | 'UPDATE_FAILURE'

export interface IOfferValidation {
  general?: string | undefined
  code?: TOfferErrorCode | undefined
}

export type TOfferResponse = IOfferDocument & { id: string }

export type TLockedPrice = {
  offer_id: string
  offer_name: string
}

export type TLockedPricesMap = Record<string, TLockedPrice>

// New Offer
export type TAddOfferResponse =
  | {
      success: true
      offer: { id: string }
    }
  | {
      success: false
      errors: IOfferValidation
    }

// Get Offers
export type TGetOffersResponse =
  | {
      success: true
      offers: TOfferLookupResponse[]
    }
  | {
      success: false
      errors: IOfferValidation
    }

// Delete Offer
export type TDeleteOfferData = { id: string; name: string }

export type TDeleteOfferResponse =
  | {
      success: true
      offer: { name: string }
      productsId: { id: string }[]
      productsDraftId: { id: string }[]
    }
  | {
      success: false
      errors: IOfferValidation
    }

// Get Offers Props
export type TGetOffersPropsResponse<T> =
  | {
      success: true
      offers: WithId<T>[]
    }
  | {
      success: false
      errors: IOfferValidation
    }

// Get Offer by Slug
export type TGetOfferData = { slug: string }

export type TGetOfferLookupResponse =
  | {
      success: true
      offer: TOfferLookupResponse
    }
  | {
      success: false
      errors: IOfferValidation
    }

// Update Offer
export type TUpdateOfferData = WithId<Partial<TOfferData>>

export type TUpdateOfferResponse =
  | {
      success: true
      offer: { id: string; slug: string }
      productsId: { id: string }[]
    }
  | {
      success: false
      errors: IOfferValidation
    }

// Check Duplicate Offer
export type TQueryDuplicateGuaranteePropData = {
  key: keyof Prettify<Omit<IOfferDocument, 'schema_version'>>
  value: string
}

export type TCheckDuplicateOfferResponse =
  | {
      isDuplicate: true
      message: IOfferValidation
    }
  | {
      isDuplicate: false
      message: null
    }
