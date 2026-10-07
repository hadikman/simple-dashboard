import { ObjectId } from 'mongodb'

import type {
  PartialByRecursive,
  Prettify,
  ProjectionKeys,
  WithId,
} from '@/helpers/ts-utils'

// Post interfaces & types
export interface IPostContent {
  json: Record<string, unknown>
  html: string
  text: string
}

export type TPostStatus = 'draft' | 'published'

export interface IPostImage {
  src: string
  alt: string
}

export interface ILinkedPosts {
  related: ObjectId[]
}

export interface IPostAdvanced {
  enable_comments: boolean
  scheduled_publish: Date | null
}

export interface IPostDocument {
  schema_version: number
  post_group_id: string
  title: string
  slug: string
  content: IPostContent
  excerpt: string
  author_id: ObjectId
  author_name: string
  status: TPostStatus
  categories: ObjectId[]
  thumbnail_image: IPostImage
  has_draft: boolean
  is_published: boolean
  comments: ObjectId[]
  comment_count: number
  view_count: number
  linked_posts: ILinkedPosts
  advanced: IPostAdvanced
  published_at: Date | null
  created_at: Date
  updated_at: Date | null
}

export interface IPostCategoriesLookup {
  _id: ObjectId
  name: string
}

export interface ILinkedPostLookup {
  _id: ObjectId
  post_group_id: string
  title: string
}
export interface ILinkedPostsLookup {
  related: ILinkedPostLookup[]
}

export interface IPostLookupDocument {
  _id: ObjectId
  post_group_id: string
  schema_version: number
  title: string
  slug: string
  content: IPostContent
  excerpt: string
  author_id: ObjectId
  author_name: string
  status: TPostStatus
  categories: IPostCategoriesLookup[]
  thumbnail_image: IPostImage
  has_draft: boolean
  is_published: boolean
  comments: ObjectId[]
  comment_count: number
  view_count: number
  linked_posts: ILinkedPostsLookup
  advanced: IPostAdvanced
  published_at: Date | null
  created_at: Date
  updated_at: Date | null
}

export type TRemovedUnchangeablePostsProps = Omit<
  IPostDocument,
  | 'schema_version'
  | 'author_id'
  | 'comments'
  | 'comment_count'
  | 'view_count'
  | 'published_at'
  | 'created_at'
  | 'updated_at'
>

export type TPostData = Prettify<
  TRemovedUnchangeablePostsProps & {
    author_id: string
  }
>

export type TLinkedPostLookupWithId = Prettify<
  WithId<Omit<ILinkedPostLookup, '_id'>>
>

export type TPostLookupDataWithId = Prettify<
  Omit<
    IPostLookupDocument,
    '_id' | 'schema_version' | 'author_id' | 'categories' | 'linked_posts'
  > & {
    id: string
    author_id: string
    categories: (Omit<IPostCategoriesLookup, '_id'> & { id: string })[]
    linked_posts: {
      related: TLinkedPostLookupWithId[]
    }
  }
>

export type TPostPropsData = Omit<
  TRemovedUnchangeablePostsProps,
  | 'id'
  | 'post_group_id'
  | 'status'
  | 'has_draft'
  | 'is_published'
  | 'categories'
  | 'linked_posts'
>

export type TPostLookupResponse = TPostLookupDataWithId

export type TPostsForLinkingResponse = TLinkedPostLookupWithId

export type TPostErrorCode =
  | 'DUPLICATE_SLUG'
  | 'FAILURE_DRAFT'
  | 'FAILURE'
  | 'EMPTY_POSTS'
  | 'EMPTY_POSTS_DRAFT'
  | 'DELETE_DRAFT_FAILURE'
  | 'DELETE_FAILURE'
  | 'NOT_FOUND_POSTS_PROPS'
  | 'NOT_FOUND_POST'
  | 'DUPLICATE_PROP'
  | 'UPDATE_FAILURE'
  | 'NOT_FOUND_POST_TO_DUPLICATE'
  | 'DUPLICATE_POST_INTO_DRAFT_FAILURE'
  | 'UPDATE_POST_PROP_FAILURE'
  | 'DELETE_DRAFTS_FAILURE'
  | 'DELETE_POSTS_FAILURE'
  | 'COPY_FAILURE'
export interface IPostValidation {
  general?: string | undefined
  code?: TPostErrorCode | undefined
}

// New Post
export type TAddPostResponse =
  | {
      success: true
      post: { id: string; post_group_id: string }
    }
  | {
      success: false
      errors: IPostValidation
    }

// Check Duplicate Post
export type TQueryDuplicatePostData = {
  postGroupId?: string
  slug: string
}

export type TCheckDuplicatePostResponse =
  | {
      isDuplicate: true
      message: IPostValidation
    }
  | {
      isDuplicate: false
      message: null
    }

// Get Posts
export type TQueryPostsData = {
  type: TPostStatus
}

export type TGetPostsResponse =
  | {
      success: true
      posts: TPostLookupResponse[]
    }
  | {
      success: false
      errors: IPostValidation
    }

// Delete Post
export type TDeletePostData = {
  id: string
  postGroupId: string
  title: string
  hasDraft: boolean
  onlyDeleteDraft?: boolean
}

export type TDeletePostResponse =
  | {
      success: true
      post: { id: string; title: string }
    }
  | {
      success: false
      errors: IPostValidation
    }

// Get Posts Props
export type TQueryPostsPropsData<T> = {
  keys: ProjectionKeys<T>
  type?: TPostStatus
}

export type TGetPostsPropsResponse<T> =
  | {
      success: true
      posts: WithId<T>[]
    }
  | {
      success: false
      errors: IPostValidation
    }

// Get Post by Slug
export type TQueryPostData = {
  slug: string
  type?: TPostStatus
  groupId?: string
}

export type TGetPostLookupResponse =
  | {
      success: true
      post: TPostLookupResponse
    }
  | {
      success: false
      errors: IPostValidation
    }

// Update Post
export type TUpdatePostData = WithId<Partial<TPostData>>

export type TUpdatePostResponse =
  | {
      success: true
      post: { id: string; slug: string }
    }
  | {
      success: false
      errors: IPostValidation
    }

// Get Posts for Linking
export type TGetPostsForLinkingResponse =
  | {
      success: true
      posts: TPostsForLinkingResponse[]
    }
  | {
      success: false
      errors: IPostValidation
    }

// Duplicate Post Into Draft
export type TDuplicatePostIntoDraftData = { postGroupId: string }

export type TDuplicatePostIntoDraftResponse =
  | {
      success: true
      post: { id: string; title: string; slug: string }
    }
  | {
      success: false
      errors: IPostValidation
    }

// Update Post Prop
export type TUpdatePostPropData = {
  id: string
  post_group_id: string
  status: TPostStatus
  updatePropsData: PartialByRecursive<TPostPropsData>
}

export type TUpdatePostPropDataResponse =
  | {
      success: true
      value: unknown
    }
  | {
      success: false
      errors: IPostValidation
    }

// Delete posts
export type TDeletePostsData = {
  id: string
  postGroupId: string
  hasDraft: boolean
  isPublished?: boolean
  onlyDeleteDraft?: boolean
}[]

export type TDeletePostsResponse =
  | {
      success: true
      deleteCount: number
    }
  | {
      success: false
      errors: IPostValidation
    }
