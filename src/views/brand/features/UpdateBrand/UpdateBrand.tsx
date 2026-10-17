'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import { useMediaStore } from '@/views/media'

import {
  type TGetCategoriesResponse,
  buildRootCategories,
} from '@/views/category'

import {
  type TBrandLookupDataWithIdCategoriesWithTitle,
  type TGetBrandLookupResponse,
  BrandForm,
  brandErrors,
} from '../../shared'

import { FieldTitle } from '@/components/ui/field'
import { createUpdateBrandDefaults } from './update-brand.defaults'
import { handleUpdateBrandSubmit } from './update-brand.submit'

type UpdateBrandProps = {
  brandKey: string
  brandData: TGetBrandLookupResponse
  categoriesData: TGetCategoriesResponse
}

export function UpdateBrand({
  brandKey,
  brandData,
  categoriesData,
}: UpdateBrandProps) {
  const router = useRouter()

  const isBrandData = brandData.success
  const isCategoriesData = categoriesData.success

  const initialValues: TBrandLookupDataWithIdCategoriesWithTitle = isBrandData
    ? {
        ...brandData.brand,
        // Convert categories from DB shape to combobox shape { id, title }
        categories: brandData.brand.categories?.map(({ id, name }) => ({
          id,
          title: name,
        })),
      }
    : {}

  // Freeze to prevent accidental mutation during render
  if (isBrandData) Object.freeze(initialValues)

  const mediaKey = `brand-${initialValues.id}`
  const MEDIA_HREF = '/dashboard/products/brands/media'

  // ─── Media store ─────────────────────────────────────────
  const thumbnailImages = useMediaStore(mediaKey, s => s.thumbnailImages)
  const initialThumbnailImages = useMediaStore(
    mediaKey,
    s => s.initialThumbnailImages,
  )
  const setThumbnailImages = useMediaStore(mediaKey, s => s.setThumbnailImages)
  const clearAll = useMediaStore(mediaKey, s => s.clearAll)

  React.useEffect(() => {
    // Sync store on mount / data change
    if (initialValues.logo?.src) {
      initialThumbnailImages(initialValues.logo.src)
    }
    // Clear store on unmount (remount via key)
    return () => {
      clearAll()
    }
  }, [clearAll, initialThumbnailImages, initialValues.logo?.src])

  // ─── Derived data ────────────────────────────────────────
  const rootCategories = isCategoriesData
    ? buildRootCategories(categoriesData.categories)
    : []

  // Media initial value is changed by useEffect not by user
  const hasChangedLogo = initialValues.logo?.src !== (thumbnailImages[0] ?? '')

  // ─── Render ──────────────────────────────────────────────
  return (
    <BrandForm
      key={brandKey}
      formId="update-brand-form"
      legend={`Update ${isBrandData ? brandData.brand.name : 'Brand'}`}
      description="Fill the desired fields"
      defaultValues={createUpdateBrandDefaults(initialValues)}
      mediaKey={mediaKey}
      mediaHref={MEDIA_HREF}
      errorBanner={
        !isBrandData ? (
          <FieldTitle className="text-destructive">
            Failure to get the brand details:{' '}
            {brandData.errors.code
              ? brandErrors[brandData.errors.code].client
              : 'Please try again!'}
          </FieldTitle>
        ) : undefined
      }
      onSubmit={async ({ value, form }) => {
        if (!isBrandData) return

        const result = await handleUpdateBrandSubmit({
          values: value,
          brand: brandData.brand,
          form,
          hasChangedLogo,
        })

        if ('success' in result && result.success) {
          if (result.shouldNavigate) {
            router.replace(`/dashboard/products/brands/${result.slug}`)
          }
        }
      }}
      fieldsProps={{
        isCreate: false,
        isCategoriesData,
        rootCategories,
        initialValues,
        mediaHref: MEDIA_HREF,
        mediaKey,
        thumbnailImages,
        setThumbnailImages,
        brandSlug: isBrandData ? brandData.brand.slug : undefined,
      }}
    />
  )
}
