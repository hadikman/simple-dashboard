'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import { useMediaStore } from '@/views/media'

import { type FlatCategoryNode } from '@/views/category'

import { type TGetBrandsResponse } from '@/views/brand'

import { type TGetFeaturesResponse } from '@/views/features'

import {
  type TGetProductLookupResponse,
  type TGetProductsForLinkingResponse,
  type TProductLookupDataWithIdCategoriesWithTitle,
  type TProductStatus,
  getCategoriesWithParentMap,
  getProductFeatureUtils,
  productErrors,
  ProductForm,
} from '../../shared'

import { Badge } from '@/components/ui/badge'
import { FieldTitle } from '@/components/ui/field'
import { useIsMobile } from '@/hooks/use-mobile'
import { createUpdateProductDefaults } from './update-product.defaults'
import { handleUpdateProductSubmit } from './update-product.submit'

type UpdateProductProps = {
  productKey: string
  userId: string
  productData: TGetProductLookupResponse
  flattenedCategoriesData: FlatCategoryNode[]
  brandsData: TGetBrandsResponse
  productsForLinkingData: TGetProductsForLinkingResponse
  featuresData: TGetFeaturesResponse
  productPageType: TProductStatus
}

export function UpdateProduct({
  productKey,
  userId,
  productData,
  flattenedCategoriesData,
  brandsData,
  productsForLinkingData,
  featuresData,
  productPageType,
}: UpdateProductProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [editorResetKey, setEditorResetKey] = React.useState(0)

  const isProductData = productData.success
  const isDraftMode = productPageType === 'draft'

  const initialValues: TProductLookupDataWithIdCategoriesWithTitle =
    isProductData
      ? {
          ...productData.product,
          categories: productData.product.categories?.map(({ id, name }) => ({
            id,
            title: name,
          })),
        }
      : {}

  if (isProductData) Object.freeze(initialValues)

  const isAuditMode = initialValues.has_draft && !initialValues.is_published
  const productGroupId = initialValues.product_group_id
  const mediaKey = isDraftMode ? `draft-${productGroupId}` : productGroupId!
  const MEDIA_HREF = '/dashboard/products/all-products/media'

  const thumbnailImages = useMediaStore(mediaKey, s => s.thumbnailImages)
  const images = useMediaStore(mediaKey, s => s.images)
  const initialThumbnailImages = useMediaStore(
    mediaKey,
    s => s.initialThumbnailImages,
  )
  const initialImages = useMediaStore(mediaKey, s => s.initialImages)
  const setThumbnailImages = useMediaStore(mediaKey, s => s.setThumbnailImages)
  const toggleImages = useMediaStore(mediaKey, s => s.toggleImages)
  const clearAll = useMediaStore(mediaKey, s => s.clearAll)

  React.useEffect(() => {
    if (initialValues.thumbnail_image?.src) {
      initialThumbnailImages(initialValues.thumbnail_image.src)
    }
    if (initialValues.images?.length) {
      initialImages(initialValues.images.map(img => img.src!).filter(Boolean))
    }
    return () => {
      clearAll()
    }
  }, [
    clearAll,
    initialThumbnailImages,
    initialImages,
    initialValues.thumbnail_image?.src,
    initialValues.images,
  ])

  const isCategoriesData = flattenedCategoriesData.length > 0
  const isBrandsData = brandsData.success
  const isFeaturesData = featuresData.success
  const isProductsForLinkingData =
    productsForLinkingData.success && !!productsForLinkingData.products.length

  const productsForLinking = isProductsForLinkingData
    ? productsForLinkingData.products.filter(
        p => p.product_group_id !== productGroupId,
      )
    : []

  const categoriesWithParentMap = React.useMemo(
    () => getCategoriesWithParentMap(flattenedCategoriesData),
    [flattenedCategoriesData],
  )

  const initialFeaturesMap = new Map<
    string,
    { feature_id: string; value_id: number; value: string }
  >()
  initialValues.features?.forEach(({ feature_id, ...rest }) =>
    initialFeaturesMap.set(feature_id, {
      feature_id,
      value_id: rest.value_id,
      value: rest.value_name,
    }),
  )

  const readyFeaturesData = React.useMemo(
    () => (isFeaturesData ? featuresData.features : []),
    [featuresData, isFeaturesData],
  )

  const { featuresIdxsMap, groupedFeaturesSorted } = React.useMemo(
    () => getProductFeatureUtils(readyFeaturesData),
    [readyFeaturesData],
  )

  function getInitialFeatures() {
    return [
      ...featuresIdxsMap
        .keys()
        .map(featureId => initialFeaturesMap.get(featureId)),
    ]
  }

  return (
    <ProductForm
      key={productKey}
      formId="update-product-form"
      legend={`Update ${isProductData ? productData.product.title : 'Product'}`}
      description="Fill the desired fields"
      defaultValues={createUpdateProductDefaults(
        initialValues,
        isDraftMode,
        getInitialFeatures(),
      )}
      mediaKey={mediaKey}
      mediaHref={MEDIA_HREF}
      badges={
        <>
          {isAuditMode && <Badge variant="default">Audit Mode</Badge>}
          {!isAuditMode && isDraftMode && (
            <Badge variant="outline">Draft Mode</Badge>
          )}
        </>
      }
      errorBanner={
        !isProductData ? (
          <FieldTitle className="text-destructive">
            Failure to get the product details:{' '}
            {productData.errors.code
              ? productErrors[productData.errors.code].client
              : 'Please try again!'}
          </FieldTitle>
        ) : undefined
      }
      onSubmit={async ({ value, meta, form }) => {
        if (!isProductData) return

        const brandId =
          value.brand_name && isBrandsData
            ? brandsData.brands.find(b => b.name === value.brand_name)?.id
            : undefined

        const result = await handleUpdateProductSubmit({
          initialValues,
          values: value,
          meta,
          userId,
          product: productData.product,
          productPageType,
          form,
          brandId,
          categoriesWithParentMap,
          featuresIdxsMap,
          groupedFeaturesSorted,
        })

        if ('success' in result && result.success) {
          if (result.shouldClearMedia) {
            clearAll()
            setEditorResetKey(k => k + 1)
          }
          if (result.shouldNavigate) {
            let slugPath = `/${result.slug}`
            if (meta === 'draft') {
              slugPath = `/draft${slugPath}?group-id=${productData.product.product_group_id}`
            }
            router.replace(`/dashboard/products/all-products${slugPath}`)
          }
        }
      }}
      fieldsProps={{
        isCreate: false,
        isCategoriesData,
        isProductsForLinkingData,
        flattenedCategoriesData,
        brandsData,
        productsForLinking,
        featuresData,
        initialValues,
        categoriesWithParentMap,
        featuresIdxsMap,
        groupedFeaturesSorted,
        mediaHref: MEDIA_HREF,
        mediaKey,
        thumbnailImages,
        images,
        setThumbnailImages,
        toggleImages,
        productGroupId,
        productSlug: isProductData ? productData.product.slug : undefined,
        isMobile,
        editorResetKey,
      }}
    />
  )
}
