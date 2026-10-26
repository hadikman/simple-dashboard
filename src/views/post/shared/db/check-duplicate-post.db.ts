import {
  postErrors,
  type IPostDocument,
  type TCheckDuplicatePostResponse,
  type TQueryDuplicatePostData,
} from '../../shared'
import { getPublishedSlugCached } from '../../shared/server'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function checkDuplicatePost(
  checkDuplicatePostData: TQueryDuplicatePostData,
): Promise<TCheckDuplicatePostResponse> {
  const collection = await mongoManager.getCollection<IPostDocument>(
    COLLECTIONS.POSTS,
  )
  const { slug, postGroupId } = checkDuplicatePostData
  let existingSlugPost = null,
    publishedSlug = null

  // Allow draft posts to reuse the slug from their published version
  if (postGroupId) {
    ;[existingSlugPost, publishedSlug] = await Promise.all([
      collection.findOne({ slug }, { projection: { _id: 1 } }),
      getPublishedSlugCached(collection, postGroupId),
    ])
  } else {
    existingSlugPost = await collection.findOne(
      { slug },
      { projection: { _id: 1 } },
    )
  }

  const isSameWithPublishedSlug = publishedSlug === slug

  if (existingSlugPost && !isSameWithPublishedSlug) {
    return {
      isDuplicate: true,
      message: {
        general: postErrors['DUPLICATE_SLUG'].server,
        code: 'DUPLICATE_SLUG',
      },
    }
  }

  return {
    isDuplicate: false,
    message: null,
  }
}
