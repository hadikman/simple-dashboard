'use client'

import { z } from 'zod'

import type { Prettify } from '@/helpers/ts-utils'

import { type RootCategories } from '@/views/category'

import { type TBrandLookupDataWithId } from './'

import { useAppForm } from '@/hooks/create-react-form-hook'

// It should be the same as type of ComboboxItemType in ComboboxField
const CategoryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
})

const LogoSchema = z.object({
  src: z.string().nullish(),
  alt: z.string().nullish(),
})

function optionalRegexString(regex: RegExp, message: string) {
  return z.union([
    z.string().trim().regex(regex, message).nullish(),
    z.literal(''),
  ])
}

// ─── Single schema for both Create and Update ────────────────
// Required fields always have values in both modes:
//   Create → user fills them in
//   Update → pre-populated from DB
// Optional fields use .nullish() to support three-state update:
//   value = update, null = clear, undefined = skip
export const BrandSchema = z.object({
  name: z.string().trim().min(1, 'The value is required.'),
  slug: z.string().trim().nullish(),
  description: z.string().trim().nullish(),
  categories: z.array(CategoryItemSchema).nullish(),
  logo: LogoSchema.nullish(),
  website: z.string().trim().nullish(),
  email: z.union([z.email().nullish(), z.literal('')]),
  phone: optionalRegexString(
    /^[+0-9()\-\s]+$/,
    `Allowed characters: 0–9, spaces, +, -, (). Example: +1 (555) 123-4567`,
  ),
})

export type BrandSchemaT = z.input<typeof BrandSchema>

function _getBrandFormType() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAppForm({
    defaultValues: {} as BrandSchemaT,
    validators: { onSubmit: BrandSchema },
  })
}
export type BrandFormT = ReturnType<typeof _getBrandFormType>

// Matching title with ComboboxItemType in ComboboxField
export type TBrandLookupDataWithIdCategoriesWithTitle = Partial<
  Omit<TBrandLookupDataWithId, 'categories'> & {
    categories: BrandSchemaT['categories']
  }
>

// Matching title with ComboboxItemType in ComboboxField
export type RootCategoriesWithTitle = Prettify<
  Omit<RootCategories, 'name'> & { title: string }
>

// Extactly the same as type of ComboboxItemType in ComboboxField
export type ComboboxItemType = {
  id: string
  title: string
}
