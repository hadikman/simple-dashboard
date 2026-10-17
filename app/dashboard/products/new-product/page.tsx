import { Metadata } from 'next'
import React from 'react'

import {
  UserIdHydrationBoundary,
  getUserQueryOptions,
} from '@/views/authentication'

import {
  buildFlattenedCategoriesList,
  processCategoriesData,
  queryCategories,
} from '@/views/category'

import { AddProductPage, queryProductsForLinking } from '@/views/product'

import { queryBrands } from '@/views/brand'

import { queryFeatures } from '@/views/features'

export const metadata: Metadata = {
  title: 'New Product',
}

export default function NewProduct() {
  const categoriesData = React.use(
    queryCategories({ category_group: 'products' }),
  )
  const brandsData = React.use(queryBrands())
  const featuresData = React.use(queryFeatures())
  const productsForLinking = React.use(queryProductsForLinking())

  const categories = categoriesData.success ? categoriesData.categories : []
  const processedCategoriesData = processCategoriesData(categories)
  const flattenedCategoriesData = buildFlattenedCategoriesList(
    processedCategoriesData,
  )

  return (
    <UserIdHydrationBoundary queryOptions={getUserQueryOptions}>
      {userId => (
        <AddProductPage
          userId={userId}
          brandsData={brandsData}
          flattenedCategoriesData={flattenedCategoriesData}
          productsForLinkingData={productsForLinking}
          featuresData={featuresData}
        />
      )}
    </UserIdHydrationBoundary>
  )
}
