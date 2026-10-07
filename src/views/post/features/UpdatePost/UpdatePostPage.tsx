import React from 'react'

import {
  buildFlattenedCategoriesList,
  processCategoriesData,
  queryCategories,
} from '@/views/category'

import { queryPost, type TPostStatus } from '../../shared'

import { Spinner } from '@/components/ui/spinner'
import { queryPostsForLinking } from './query-posts-for-linking'
import { UpdatePost } from './UpdatePost'

type UpdatePostPageProps = {
  userId: string
  groupId?: string
  postPageSlug: string
  postPageType: TPostStatus
}

export function UpdatePostPage({
  userId,
  groupId,
  postPageSlug,
  postPageType,
}: UpdatePostPageProps) {
  const postData = React.use(
    queryPost({ slug: postPageSlug, type: postPageType, groupId }),
  )
  const categoriesData = React.use(queryCategories({ category_group: 'posts' }))
  const postsForLinkingData = React.use(queryPostsForLinking())

  const categories = categoriesData.success ? categoriesData.categories : []
  const processedCategoriesData = processCategoriesData(categories)

  const flattenedCategoryList = buildFlattenedCategoriesList(
    processedCategoriesData,
  )

  const postKey = postData.success
    ? `${postPageType}-${postData.post.id}-${postData.post.updated_at}`
    : `${postPageType}-${postPageSlug}`

  return (
    <React.Suspense fallback={<Spinner />}>
      <UpdatePost
        postKey={postKey}
        userId={userId}
        postData={postData}
        postPageType={postPageType}
        flattenedCategoriesData={flattenedCategoryList}
        postsForLinkingData={postsForLinkingData}
      />
    </React.Suspense>
  )
}
