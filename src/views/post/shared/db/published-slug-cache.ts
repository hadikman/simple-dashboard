import { Collection } from 'mongodb'

import { type IPostDocument } from '../../shared'

const publishedSlugCache = new Map<string, string | null>()

export async function getPublishedSlugCached(
  collection: Collection<IPostDocument>,
  postGroupId: string,
): Promise<string | null> {
  if (publishedSlugCache.has(postGroupId)) {
    return publishedSlugCache.get(postGroupId)!
  }

  const data = await collection
    .find({}, { projection: { _id: 0, post_group_id: 1, slug: 1 } })
    .toArray()

  for (let i = 0; i < data.length; i++) {
    publishedSlugCache.set(data[i].post_group_id, data[i].slug)
  }

  return publishedSlugCache.get(postGroupId) ?? null
}

/**
 * Call after creating a new post or updating a post's slug
 */
export function setPublishedSlugCache(postGroupId: string, slug: string) {
  publishedSlugCache.set(postGroupId, slug)
}

/**
 * Call after deleting a post
 */
export function deletePublishedSlugCache(postGroupId: string) {
  publishedSlugCache.delete(postGroupId)
}
