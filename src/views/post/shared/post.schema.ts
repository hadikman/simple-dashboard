'use client'

import { z } from 'zod'

import { type FlatCategoryNode } from '@/views/category'

import { type TPostLookupDataWithId } from '../shared'

import { Prettify } from '@/helpers/ts-utils'
import { useAppForm } from '@/hooks/create-react-form-hook'

const ContentSchema = z.object({
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

const LinkedPostsSchema = z.object({
  related: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
      }),
    )
    .nullish(),
})

// ─── Single schema for both Create and Update ────────────────
// Required fields always have values in both modes:
//   Create → user fills them in
//   Update → pre-populated from DB
// Optional fields use .nullish() to support three-state update:
//   value = update, null = clear, undefined = skip
export const PostSchema = z.object({
  title: z.string().trim().min(1, 'The value is required.'),
  slug: z.string().trim().nullish(),
  content: ContentSchema,
  excerpt: z.string().trim().nullish(),
  categories: z.array(CategoryItemSchema).nullish(),
  thumbnail_image: ImageSchema.nullish(),
  linked_posts: LinkedPostsSchema,
  advanced: z.object({
    enable_comments: z.boolean().nullish(),
    scheduled_publish: z.union([z.date().nullish(), z.literal('')]),
  }),
})

export type PostSchemaT = z.input<typeof PostSchema>
function _getPostFormType() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAppForm({
    defaultValues: {} as PostSchemaT,
    validators: {
      onSubmit: PostSchema,
    },
  })
}
export type PostFormT = ReturnType<typeof _getPostFormType>

// Matching title with ComboboxItemType in ComboboxField
export type TPostLookupDataWithIdCategoriesWithTitle = Partial<
  Omit<TPostLookupDataWithId, 'categories'> & {
    categories: PostSchemaT['categories']
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
