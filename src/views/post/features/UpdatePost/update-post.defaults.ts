import {
  type PostSchemaT,
  type TPostLookupDataWithIdCategoriesWithTitle,
} from '../../shared'

/**
 * Build default values for the update form.
 *
 * - title & slug: Always populated (required by schema; always visible to user).
 * - Draft mode: Populate ALL fields with DB values (user may publish directly
 *   without re-editing, so form must hold the complete post).
 * - Published mode: Set optional fields to null (three-state submission —
 *   only user-touched fields are sent to minimize payload).
 */
export function createUpdatePostDefaults(
  post: TPostLookupDataWithIdCategoriesWithTitle,
  isDraftMode: boolean,
): PostSchemaT {
  const v = isDraftMode ? (val: unknown) => val : () => null

  return {
    title: post.title ?? '',
    slug: post.slug ?? '',
    content: {
      json: v(post.content?.json) as PostSchemaT['content']['json'],
      html: v(post.content?.html) as PostSchemaT['content']['html'],
      text: v(post.content?.text) as PostSchemaT['content']['text'],
    },
    excerpt: v(post.excerpt) as PostSchemaT['excerpt'],
    categories: v(post.categories) as PostSchemaT['categories'],
    thumbnail_image: post.thumbnail_image ?? { src: null, alt: null },
    linked_posts: {
      related: v(
        post.linked_posts?.related,
      ) as PostSchemaT['linked_posts']['related'],
    },
    advanced: {
      enable_comments: v(
        post.advanced?.enable_comments,
      ) as PostSchemaT['advanced']['enable_comments'],
      scheduled_publish: v(
        post.advanced?.scheduled_publish,
      ) as PostSchemaT['advanced']['scheduled_publish'],
    },
  }
}
