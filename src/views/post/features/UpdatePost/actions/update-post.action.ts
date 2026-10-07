'use server'

import { revalidatePath, revalidateTag, updateTag } from 'next/cache'

import { type TUpdatePostData, deletePostAction } from '../../../shared'
import { setPublishedSlugCache } from '../../../shared/server'

import { parseFormDataByKey, removeNullByRecursive } from '@/helpers/utils'
import { updatePost } from '../db/update-post.db'

type UpdatePostActionProps = {
  formData: FormData
  currentSlug: string
  isPublishedOfDraftedPost: boolean
}

type ScheduledPublish = NonNullable<
  TUpdatePostData['advanced']
>['scheduled_publish']

export async function updatePostAction({
  formData,
  currentSlug,
  isPublishedOfDraftedPost,
}: UpdatePostActionProps) {
  const advancedScheduledPublish = parseFormDataByKey(
    formData,
    'scheduled_publish',
  ) as ScheduledPublish

  const rawData: TUpdatePostData = {
    id: parseFormDataByKey(formData, 'id'),
    post_group_id: parseFormDataByKey(formData, 'post_group_id'),
    title: parseFormDataByKey(formData, 'title'),
    slug: parseFormDataByKey(formData, 'slug'),
    content: {
      json: parseFormDataByKey(formData, 'content_json'),
      html: parseFormDataByKey(formData, 'content_html'),
      text: parseFormDataByKey(formData, 'content_text'),
    },
    excerpt: parseFormDataByKey(formData, 'excerpt'),
    author_id: parseFormDataByKey(formData, 'author_id'),
    status: parseFormDataByKey(formData, 'status'),
    categories: parseFormDataByKey(formData, 'categories'),
    thumbnail_image: {
      src: parseFormDataByKey(formData, 'thumbnail_image_src'),
      alt: parseFormDataByKey(formData, 'thumbnail_image_alt'),
    },
    has_draft: parseFormDataByKey(formData, 'has_draft'),
    is_published: parseFormDataByKey(formData, 'is_published'),
    linked_posts: {
      related: parseFormDataByKey(formData, 'related'),
    },
    advanced: {
      enable_comments: parseFormDataByKey(formData, 'enable_comments'),
      scheduled_publish: (advancedScheduledPublish
        ? new Date(advancedScheduledPublish)
        : isPublishedOfDraftedPost
          ? '' // Empty string is added for this flow: publish mode, clear date then save as draft → draft mode, without touching date then publish again. So date is null here that is converted to empty string to reflect cleared date into publish mode correctly.
          : advancedScheduledPublish) as ScheduledPublish,
    },
  }

  const data = removeNullByRecursive(rawData)

  if (isPublishedOfDraftedPost) {
    data.has_draft = false
  }

  const result = await updatePost(data)

  if (result.success) {
    // Delete draft on switching to published mode
    if (isPublishedOfDraftedPost) {
      const { id, post_group_id, title } = data
      await deletePostAction({
        id,
        postGroupId: post_group_id!,
        title: title || 'Unknown Title',
        hasDraft: true,
        onlyDeleteDraft: true,
      })

      if (result.post.slug) {
        setPublishedSlugCache(data.post_group_id!, result.post.slug)
      }
    }

    if (data.status === 'draft') {
      // Don't need to update post draft cache like post published cache
      updateTag('post-draft-' + result.post.id)
      updateTag('posts-props-draft')
      updateTag('posts-draft-list')
    } else {
      // If the slug is updated, don't need to update post published cache, it must shows stale data until fresh data be ready, otherwise the cache need to update to show fresh data immediately
      if (currentSlug === result.post.slug) {
        updateTag('post-' + result.post.id)
      } else {
        revalidatePath('/dashboard/posts/all-posts/' + result.post.slug)

        setPublishedSlugCache(data.post_group_id!, result.post.slug)
      }
      updateTag('posts-props')
      updateTag('posts-list')
      revalidateTag('posts-for-linking-list', 'max')
    }
  }

  return result
}
