import { type PostSchemaT, type TPostStatus } from '../../shared'

import { appendIfDefined } from '@/helpers/utils'

export function buildUpdatePostFormData(
  values: PostSchemaT,
  userId: string,
  meta: TPostStatus,
  postId: string,
  postGroupId: string,
): FormData {
  const fd = new FormData()
  const {
    title,
    slug,
    content,
    excerpt,
    categories,
    thumbnail_image,
    linked_posts,
    advanced,
  } = values

  // Always sent
  appendIfDefined(fd, 'id', postId)
  appendIfDefined(fd, 'post_group_id', postGroupId)
  appendIfDefined(fd, 'author_id', userId)
  appendIfDefined(fd, 'status', meta)

  if (meta === 'draft') appendIfDefined(fd, 'has_draft', true)
  if (meta === 'published') appendIfDefined(fd, 'is_published', true)

  // Required (always have values)
  appendIfDefined(fd, 'title', title)
  appendIfDefined(fd, 'slug', slug)

  // Optional fields
  if (content.json) appendIfDefined(fd, 'content_json', content.json)
  if (content.html) appendIfDefined(fd, 'content_html', content.html)
  if (content.text) appendIfDefined(fd, 'content_text', content.text)

  appendIfDefined(fd, 'excerpt', excerpt)

  if (categories) {
    appendIfDefined(
      fd,
      'categories',
      categories.map(c => c.id),
    )
  }

  appendIfDefined(fd, 'thumbnail_image_src', thumbnail_image?.src)
  appendIfDefined(fd, 'thumbnail_image_alt', thumbnail_image?.alt)
  appendIfDefined(fd, 'related', linked_posts.related)
  appendIfDefined(fd, 'enable_comments', advanced.enable_comments)
  appendIfDefined(fd, 'scheduled_publish', advanced.scheduled_publish)

  return fd
}
