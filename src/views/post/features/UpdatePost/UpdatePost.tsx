'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import type { FlatCategoryNode } from '@/views/category'

import { useMediaStore } from '@/views/media'

import {
  type TGetPostLookupResponse,
  type TGetPostsForLinkingResponse,
  type TPostLookupDataWithIdCategoriesWithTitle,
  type TPostStatus,
  postErrors,
  PostForm,
} from '../../shared'

import { Badge } from '@/components/ui/badge'
import { FieldTitle } from '@/components/ui/field'
import { useIsMobile } from '@/hooks/use-mobile'
import { createUpdatePostDefaults } from './update-post.defaults'
import { handleUpdatePostSubmit } from './update-post.submit'

type UpdatePostProps = {
  postKey: string
  userId: string
  postData: TGetPostLookupResponse
  flattenedCategoriesData: FlatCategoryNode[]
  postsForLinkingData: TGetPostsForLinkingResponse
  postPageType: TPostStatus
}

export function UpdatePost({
  postKey,
  userId,
  postData,
  flattenedCategoriesData,
  postsForLinkingData,
  postPageType,
}: UpdatePostProps) {
  const router = useRouter()
  const isMobile = useIsMobile()

  const isPostData = postData.success
  const isDraftMode = postPageType === 'draft'

  const initialValues: TPostLookupDataWithIdCategoriesWithTitle = isPostData
    ? {
        ...postData.post,
        // Convert categories from DB shape to combobox shape { id, title }
        categories: postData.post.categories?.map(({ id, name }) => ({
          id,
          title: name,
        })),
      }
    : {}

  // Freeze to prevent accidental mutation during render
  if (isPostData) Object.freeze(initialValues)

  const isAuditMode = initialValues.has_draft && !initialValues.is_published

  const postGroupId = initialValues.post_group_id
  const mediaKey = isDraftMode ? `draft-${postGroupId}` : postGroupId!
  const MEDIA_HREF = '/dashboard/posts/all-posts/media'

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
    if (initialValues.thumbnail_image?.src) {
      initialThumbnailImages(initialValues.thumbnail_image.src)
    }
    // Clear store on unmount (mode switch causes remount via key)
    return () => {
      clearAll()
    }
  }, [clearAll, initialThumbnailImages, initialValues.thumbnail_image?.src])

  // ─── Derived data ────────────────────────────────────────
  const isCategoriesData = flattenedCategoriesData.length > 0
  const isPostsForLinkingData =
    postsForLinkingData.success && !!postsForLinkingData.posts.length

  const postsForLinking = isPostsForLinkingData
    ? postsForLinkingData.posts.filter(p => p.post_group_id !== postGroupId)
    : []

  // ─── Render ──────────────────────────────────────────────
  return (
    <PostForm
      key={postKey}
      formId="update-post-form"
      legend={`Update ${isPostData ? postData.post.title : 'Post'}`}
      description="Fill the desired fields"
      defaultValues={createUpdatePostDefaults(initialValues, isDraftMode)}
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
        !isPostData ? (
          <FieldTitle className="text-destructive">
            Failure to get the post details:{' '}
            {postData.errors.code
              ? postErrors[postData.errors.code].client
              : 'Please try again!'}
          </FieldTitle>
        ) : undefined
      }
      onSubmit={async ({ value, meta, form }) => {
        if (!isPostData) return

        const result = await handleUpdatePostSubmit({
          values: value,
          meta,
          userId,
          post: postData.post,
          postPageType,
          form,
        })

        if ('success' in result && result.success) {
          if (result.shouldClearMedia) clearAll()

          if (result.shouldNavigate) {
            let slugPath = `/${result.slug}`
            if (meta === 'draft') {
              slugPath = `/draft${slugPath}?group-id=${postData.post.post_group_id}`
            }
            router.replace(`/dashboard/posts/all-posts${slugPath}`)
          }
        }
      }}
      fieldsProps={{
        isCreate: false,
        isCategoriesData,
        isPostsForLinkingData,
        flattenedCategoriesData,
        postsForLinking,
        initialValues,
        mediaHref: MEDIA_HREF,
        mediaKey,
        thumbnailImages,
        setThumbnailImages,
        postGroupId,
        postSlug: isPostData ? postData.post.slug : undefined,
        isMobile,
      }}
    />
  )
}
