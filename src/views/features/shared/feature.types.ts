import { ObjectId } from 'mongodb'

import type { Prettify, WithId } from '@/helpers/ts-utils'

// Feature interfaces & types
export interface IFeatureValue {
  id: number
  value: string
}

export type TFeatureStatus = 'active' | 'inactive'

export interface IFeatureDocument {
  schema_version: number
  name: string
  slug: string
  description: string
  type: string
  category: string
  values: IFeatureValue[]
  is_required: boolean
  display_order: number
  status: TFeatureStatus
  applicable_category_id: ObjectId | null
  applicable_category_name: string
  created_at: Date
  updated_at: Date | null
}

export interface IFeatureLookupDocument {
  _id: ObjectId
  schema_version: number
  name: string
  slug: string
  description: string
  type: string
  category: string
  values: IFeatureValue[]
  is_required: boolean
  display_order: number
  status: TFeatureStatus
  applicable_category_id: ObjectId | null
  applicable_category_name: string
  created_at: Date
  updated_at: Date | null
}

export type TFeatureLookupDataWithId = Prettify<
  Omit<
    IFeatureLookupDocument,
    '_id' | 'schema_version' | 'applicable_category_id'
  > & {
    id: string
    applicable_category_id: string | null
  }
>

export type TFeatureData = Prettify<
  Omit<
    IFeatureDocument,
    'schema_version' | 'applicable_category_id' | 'created_at' | 'updated_at'
  > & { applicable_category_id: string | null }
>

export type TFeatureLookupResponse = TFeatureLookupDataWithId

export type TFeatureErrorCode =
  | 'FEATURE_EXISTS'
  | 'CREATE_FAILURE'
  | 'EMPTY_FEATURES'
  | 'DELETE_FAILURE'
  | 'NOT_FOUND_FEATURES_PROPS'
  | 'NOT_FOUND_FEATURE'
  | 'DUPLICATE_PROP'
  | 'UPDATE_FAILURE'
  | 'VALUE_EXISTS'
  | 'ADD_VALUE_FAILURE'
  | 'UPDATE_VALUE_FAILURE'
  | 'DELETE_VALUE_FAILURE'

export interface IFeatureValidation {
  general?: string | undefined
  code?: TFeatureErrorCode | undefined
}

export type TFeatureResponse = WithId<IFeatureDocument>

// New Feature
export type TAddFeatureResponse =
  | {
      success: true
      feature: { id: string }
    }
  | {
      success: false
      errors: IFeatureValidation
    }

// Get Features
export type TGetFeaturesResponse =
  | {
      success: true
      features: TFeatureLookupResponse[]
    }
  | {
      success: false
      errors: IFeatureValidation
    }

// Delete Feature
export type TDeleteFeatureData = { id: string; name: string }

export type TDeleteFeatureResponse =
  | {
      success: true
      feature: { name: string }
      productsId: { id: string }[]
      productsDraftId: { id: string }[]
    }
  | {
      success: false
      errors: IFeatureValidation
    }

// Get Features Props
export type TGetFeaturesPropsResponse<T> =
  | {
      success: true
      features: WithId<T>[]
    }
  | {
      success: false
      errors: IFeatureValidation
    }

// Get Feature by Slug
export type TQueryFeatureData = { slug: string }

export type TGetFeatureLookupResponse =
  | {
      success: true
      feature: TFeatureLookupResponse
    }
  | {
      success: false
      errors: IFeatureValidation
    }

// Update Feature
export type TUpdateFeatureData = WithId<Partial<TFeatureData>>

export type TUpdateFeatureResponse =
  | {
      success: true
      feature: { id: string; slug: string }
    }
  | {
      success: false
      errors: IFeatureValidation
    }

// Check Duplicate Feature
export type TQueryDuplicateFeaturePropData = {
  key: keyof Prettify<Omit<IFeatureDocument, 'schema_version'>>
  value: string
}

export type TCheckDuplicateFeatureResponse =
  | {
      isDuplicate: true
      message: IFeatureValidation
    }
  | {
      isDuplicate: false
      message: null
    }

// Add feature Value
export type TFeatureValueData = {
  featureId: string
  value: IFeatureValue
}

export type TAddFeatureValueResponse =
  | {
      success: true
      feature: { featureId: string; id: number }
      modifiedCount: number
    }
  | {
      success: false
      errors: IFeatureValidation
    }

// Update Feature Value
export type TUpdateFeatureValueData = {
  featureId: string
  value: IFeatureValue
}

export type TUpdateFeatureValueResponse =
  | {
      success: true
      feature: { featureId: string; id: number }
      productsId: { id: string }[]
      productsDraftId: { id: string }[]
      modifiedCount: number
    }
  | {
      success: false
      errors: IFeatureValidation
    }

// Delete Feature Value
export type TDeleteFeatureValueData = {
  featureId: string
  id: number
}

export type TDeleteFeatureValueResponse =
  | {
      success: true
      feature: { featureId: string; id: number }
      productsId: { id: string }[]
      productsDraftId: { id: string }[]
      modifiedCount: number
    }
  | {
      success: false
      errors: IFeatureValidation
    }
