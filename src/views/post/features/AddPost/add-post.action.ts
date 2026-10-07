'use server'

import { revalidateTag, updateTag } from 'next/cache'

import { type TPostData, type TPostStatus } from '../../shared'
import { setPublishedSlugCache } from '../../shared/server'

import { addPost } from './add-post.db'

export async function addPostAction(formData: FormData) {
  const rawData: TPostData = {
    post_group_id: formData.get('post_group_id') as string, // Used for when update post needs to create a duplicate of the post by calling addPostAction at draft mode (post.tsx)
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    content: {
      json: JSON.parse(formData.get('content_json') as string) || {},
      html: (formData.get('content_html') as string) || '',
      text: (formData.get('content_text') as string) || '',
    },
    excerpt: (formData.get('excerpt') as string) || '',
    author_id: formData.get('author_id') as string,
    author_name: (formData.get('author_name') as string) || '',
    status: formData.get('status') as TPostStatus,
    categories: JSON.parse((formData.get('categories') as string) || '[]'),
    thumbnail_image: {
      src: (formData.get('thumbnail_image_src') as string) || '',
      alt: (formData.get('thumbnail_image_alt') as string) || '',
    },
    has_draft: formData.get('has_draft') === 'true',
    is_published: formData.get('is_published') === 'true',
    linked_posts: {
      related: formData.get('related')
        ? JSON.parse(formData.get('related') as string)
        : [],
    },
    advanced: {
      enable_comments: formData.get('enable_comments') === 'true',
      scheduled_publish: formData.get('scheduled_publish')
        ? new Date(formData.get('scheduled_publish') as unknown as Date)
        : null,
    },
  }

  const result = await addPost(rawData)

  if (result.success) {
    if (rawData.status === 'draft') {
      updateTag('posts-draft-list')
    } else {
      setPublishedSlugCache(result.post.post_group_id, rawData.slug)
    }

    updateTag('posts-list')
    revalidateTag('posts-for-linking-list', 'max')
  }

  return result
}
