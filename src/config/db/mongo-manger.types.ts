import { Document, IndexDescription } from 'mongodb'

export const COLLECTIONS = {
  USERS: 'users',
  CATEGORY: 'category',
  POSTS: 'posts',
  POSTS_DRAFT: 'posts_draft',
  PRODUCTS: 'products',
  PRODUCTS_DRAFT: 'products_draft',
  BRANDS: 'brands',
  FEATURES: 'features',
  OFFERS: 'offers',
  GUARANTEES: 'guarantees',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]

export interface CollectionConfig {
  /** JSON-schema validator, applied on create and kept in sync via collMod */
  validator?: Document
  /** Idempotent: createIndexes is a no-op for indexes that already exist */
  indexes?: IndexDescription[]
}
