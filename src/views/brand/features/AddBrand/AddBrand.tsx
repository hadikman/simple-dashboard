'use client'

import { useMediaStore } from '@/views/media'

import {
  type TGetCategoriesResponse,
  buildRootCategories,
} from '@/views/category'

import { type BrandSchemaT, BrandForm } from '../../shared'

import { createAddBrandDefaults } from './add-brand.defaults'
import { handleAddBrandSubmit } from './add-brand.submit'

type AddBrandProps = {
  categoriesData: TGetCategoriesResponse
}

export function AddBrand({ categoriesData }: AddBrandProps) {
  const mediaKey = 'brand-add'
  const MEDIA_HREF = '/dashboard/products/brands/media'

  const thumbnailImages = useMediaStore(mediaKey, s => s.thumbnailImages)
  const setThumbnailImages = useMediaStore(mediaKey, s => s.setThumbnailImages)
  const clearAll = useMediaStore(mediaKey, s => s.clearAll)

  const isCategoriesData = categoriesData.success
  const rootCategories = isCategoriesData
    ? buildRootCategories(categoriesData.categories)
    : []

  return (
    <BrandForm
      formId="new-brand-form"
      legend="Add New Brand"
      description="Fill the following fields"
      defaultValues={createAddBrandDefaults()}
      mediaKey={mediaKey}
      mediaHref={MEDIA_HREF}
      onSubmit={async ({ value, form }) => {
        const result = await handleAddBrandSubmit({
          values: value as BrandSchemaT,
          form,
        })
        if (result?.success) {
          form.reset()
          clearAll()
        }
      }}
      fieldsProps={{
        isCreate: true,
        isCategoriesData,
        rootCategories,
        initialValues: {},
        mediaHref: MEDIA_HREF,
        mediaKey,
        thumbnailImages,
        setThumbnailImages,
      }}
    />
  )
}
