import { type PostSchemaT } from '../../shared'

const EMPTY_EDITOR_VALUE = { json: null, html: null, text: null }

export function createAddPostDefaults(): PostSchemaT {
  return {
    title: '',
    slug: '',
    content: EMPTY_EDITOR_VALUE,
    excerpt: null,
    categories: [],
    thumbnail_image: { src: null, alt: null },
    linked_posts: { related: [] },
    advanced: { enable_comments: true, scheduled_publish: null },
  }
}
