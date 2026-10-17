import React from 'react'

import {
  buildFlattenedCategoriesList,
  processCategoriesData,
  queryCategories,
} from '@/views/category'

import { queryBrands } from '@/views/brand'

import { queryFeatures } from '@/views/features'

import {
  type TProductStatus,
  queryProduct,
  queryProductsForLinking,
} from '../../shared'

import { Spinner } from '@/components/ui/spinner'
import { UpdateProduct } from './UpdateProduct'

type UpdateProductPageProps = {
  userId: string
  groupId?: string
  productPageSlug: string
  productPageType: TProductStatus
}

export function UpdateProductPage({
  userId,
  groupId,
  productPageSlug,
  productPageType,
}: UpdateProductPageProps) {
  const productData = React.use(
    queryProduct({ slug: productPageSlug, type: productPageType, groupId }),
  )
  const categoriesData = React.use(
    queryCategories({ category_group: 'products' }),
  )
  const brandsData = React.use(queryBrands())
  const featuresData = React.use(queryFeatures())
  const productsForLinkingData = React.use(queryProductsForLinking())

  const categories = categoriesData.success ? categoriesData.categories : []
  const processedCategoriesData = processCategoriesData(categories)
  const flattenedCategoriesData = buildFlattenedCategoriesList(
    processedCategoriesData,
  )

  const productKey = productData.success
    ? `${productPageType}-${productData.product.id}-${productData.product.updated_at}`
    : `${productPageType}-${productPageSlug}`

  return (
    <React.Suspense fallback={<Spinner />}>
      <UpdateProduct
        productKey={productKey}
        userId={userId}
        productData={productData}
        flattenedCategoriesData={flattenedCategoriesData}
        brandsData={brandsData}
        productsForLinkingData={productsForLinkingData}
        featuresData={featuresData}
        productPageType={productPageType}
      />
    </React.Suspense>
  )
}
