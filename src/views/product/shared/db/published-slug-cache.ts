import { Collection } from 'mongodb'

import { type IProductDocument } from '../'

const publishedSlugCache = new Map<string, string | null>()

export async function getPublishedSlugCached(
  collection: Collection<IProductDocument>,
  productGroupId: string,
): Promise<string | null> {
  if (publishedSlugCache.has(productGroupId)) {
    return publishedSlugCache.get(productGroupId)!
  }

  const docs = await collection
    .find({}, { projection: { _id: 0, product_group_id: 1, slug: 1 } })
    .toArray()

  for (const doc of docs) {
    publishedSlugCache.set(doc.product_group_id, doc.slug)
  }

  return publishedSlugCache.get(productGroupId) ?? null
}

/**
 * Call after creating a new product or updating a product's slug
 */
export function setPublishedSlugCache(productGroupId: string, slug: string) {
  publishedSlugCache.set(productGroupId, slug)
}

/**
 * Call after deleting a product
 */
export function deletePublishedSlugCache(productGroupId: string) {
  publishedSlugCache.delete(productGroupId)
}
