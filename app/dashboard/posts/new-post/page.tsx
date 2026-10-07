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

import { AddPostPage, queryPostsForLinking } from '@/views/post'

export const metadata: Metadata = {
  title: 'New Post',
}

export default function AddPost() {
  const categoriesData = React.use(queryCategories({ category_group: 'posts' }))
  const postsForLinking = React.use(queryPostsForLinking())

  const categories = categoriesData.success ? categoriesData.categories : []
  const processedCategoriesData = processCategoriesData(categories)

  const flattenedCategoryList = buildFlattenedCategoriesList(
    processedCategoriesData,
  )

  return (
    <UserIdHydrationBoundary queryOptions={getUserQueryOptions}>
      {userId => (
        <AddPostPage
          userId={userId}
          flattenedCategoriesData={flattenedCategoryList}
          postsForLinkingData={postsForLinking}
        />
      )}
    </UserIdHydrationBoundary>
  )
}
