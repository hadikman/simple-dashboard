import { type PostSchemaT, type TPostStatus } from '../../shared'

// CREATE: Skip null/empty optional fields entirely
export function buildAddPostFormData(
  values: PostSchemaT,
  userId: string,
  meta: TPostStatus,
  suggestionSlug: string,
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

  fd.append('title', title)
  fd.append('slug', slug || suggestionSlug)
  fd.append('author_id', userId)
  fd.append('status', meta)

  if (content.json) fd.append('content_json', JSON.stringify(content.json))
  if (content.html) fd.append('content_html', content.html)
  if (content.text) fd.append('content_text', content.text)
  if (excerpt) fd.append('excerpt', excerpt)

  if (categories?.length) {
    fd.append('categories', JSON.stringify(categories.map(c => c.id)))
  }

  if (thumbnail_image?.src) {
    fd.append('thumbnail_image_src', thumbnail_image.src)
    fd.append('thumbnail_image_alt', thumbnail_image.alt ?? '')
  }

  if (linked_posts.related?.length) {
    fd.append('related', JSON.stringify(linked_posts.related))
  }

  fd.append('enable_comments', String(advanced.enable_comments))

  if (advanced.scheduled_publish) {
    fd.append('scheduled_publish', advanced.scheduled_publish.toISOString())
  }

  if (meta === 'draft') fd.append('has_draft', 'true')
  if (meta === 'published') fd.append('is_published', 'true')

  return fd
}
