'use client'

import { useMediaStore } from '@/views/media'

import type { FlatCategoryNode } from '@/views/category'

import {
  PostForm,
  PostSchemaT,
  type TGetPostsForLinkingResponse,
} from '../../shared'

import { useIsMobile } from '@/hooks/use-mobile'
import { createAddPostDefaults } from './add-post.defaults'
import { handleAddPostSubmit } from './add-post.submit'

type AddPostPageProps = {
  userId: string
  flattenedCategoriesData: FlatCategoryNode[]
  postsForLinkingData: TGetPostsForLinkingResponse
}

export function AddPostPage({
  userId,
  flattenedCategoriesData,
  postsForLinkingData,
}: AddPostPageProps) {
  const isMobile = useIsMobile()
  const mediaKey = 'new-post'
  const MEDIA_HREF = '/dashboard/posts/new-post/media'

  const thumbnailImages = useMediaStore(mediaKey, s => s.thumbnailImages)
  const setThumbnailImages = useMediaStore(mediaKey, s => s.setThumbnailImages)
  const clearAll = useMediaStore(mediaKey, s => s.clearAll)

  const isCategoriesData = flattenedCategoriesData.length > 0
  const isPostsForLinkingData = postsForLinkingData.success

  const postsForLinking = isPostsForLinkingData ? postsForLinkingData.posts : []

  return (
    <PostForm
      formId="add-post-form"
      legend="Add New Post"
      description="Fill the following fields"
      defaultValues={createAddPostDefaults()}
      mediaKey={mediaKey}
      mediaHref={MEDIA_HREF}
      onSubmit={async ({ value, meta, form }) => {
        const result = await handleAddPostSubmit({
          values: value as PostSchemaT,
          meta,
          userId,
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
        isPostsForLinkingData,
        flattenedCategoriesData,
        postsForLinking,
        initialValues: {},
        mediaHref: MEDIA_HREF,
        mediaKey,
        thumbnailImages,
        setThumbnailImages,
        isMobile,
      }}
    />
  )
}
