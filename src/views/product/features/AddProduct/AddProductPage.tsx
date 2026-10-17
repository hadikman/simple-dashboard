'use client'

import React from 'react'

import { useMediaStore } from '@/views/media'

import { type TGetBrandsResponse } from '@/views/brand'

import { type TGetFeaturesResponse } from '@/views/features'

import {
  type ProductSchemaT,
  type TGetProductsForLinkingResponse,
  getCategoriesWithParentMap,
  getProductFeatureUtils,
  ProductForm,
} from '../../shared'

import { useIsMobile } from '@/hooks/use-mobile'
import { FlatCategoryNode } from '@/views/category'
import { createAddProductDefaults } from './add-product.default'
import { handleAddProductSubmit } from './add-product.submit'

type AddProductPageProps = {
  userId: string
  flattenedCategoriesData: FlatCategoryNode[]
  brandsData: TGetBrandsResponse
  productsForLinkingData: TGetProductsForLinkingResponse
  featuresData: TGetFeaturesResponse
}

export function AddProductPage({
  userId,
  flattenedCategoriesData,
  brandsData,
  productsForLinkingData,
  featuresData,
}: AddProductPageProps) {
  const [editorResetKey, setEditorResetKey] = React.useState(0)
  const isMobile = useIsMobile()

  const mediaKey = 'new-product'
  const MEDIA_HREF = '/dashboard/products/new-product/media'

  const thumbnailImages = useMediaStore(mediaKey, s => s.thumbnailImages)
  const images = useMediaStore(mediaKey, s => s.images)
  const setThumbnailImages = useMediaStore(mediaKey, s => s.setThumbnailImages)
  const toggleImages = useMediaStore(mediaKey, s => s.toggleImages)
  const clearAll = useMediaStore(mediaKey, s => s.clearAll)

  const isCategoriesData = !!flattenedCategoriesData.length
  const isBrandsData = brandsData.success
  const isFeaturesData = featuresData.success
  const isProductsForLinkingData = productsForLinkingData.success

  const productsForLinking = isProductsForLinkingData
    ? productsForLinkingData.products
    : []

  const categoriesWithParentMap = React.useMemo(
    () => getCategoriesWithParentMap(flattenedCategoriesData),
    [flattenedCategoriesData],
  )

  const readyFeaturesData = React.useMemo(
    () => (isFeaturesData ? featuresData.features : []),
    [featuresData, isFeaturesData],
  )

  const { featuresIdxsMap, groupedFeaturesSorted } = React.useMemo(
    () => getProductFeatureUtils(readyFeaturesData),
    [readyFeaturesData],
  )

  return (
    <ProductForm
      formId="add-product-form"
      legend="Add New Product"
      description="Fill the following fields"
      defaultValues={createAddProductDefaults()}
      mediaKey={mediaKey}
      mediaHref={MEDIA_HREF}
      onSubmit={async ({ value, meta, form }) => {
        const brandId =
          value.brand_name && isBrandsData
            ? brandsData.brands.find(b => b.name === value.brand_name)?.id
            : undefined

        const result = await handleAddProductSubmit({
          values: value as ProductSchemaT,
          meta,
          userId,
          form,
          brandId,
        })

        if (result?.success) {
          form.reset()
          clearAll()
          setEditorResetKey(prev => prev + 1)
        }
      }}
      fieldsProps={{
        isCreate: true,
        isCategoriesData,
        isProductsForLinkingData,
        flattenedCategoriesData,
        brandsData,
        productsForLinking,
        featuresData,
        initialValues: {},
        categoriesWithParentMap,
        featuresIdxsMap,
        groupedFeaturesSorted,
        mediaHref: MEDIA_HREF,
        mediaKey,
        thumbnailImages,
        images,
        setThumbnailImages,
        toggleImages,
        isMobile,
        editorResetKey,
      }}
    />
  )
}
