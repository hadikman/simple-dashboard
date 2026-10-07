'use server'

import { cacheTag } from 'next/cache'

import { type TQueryPostData } from '../../shared'

import { getPost } from '../db/get-post.db'

export async function queryPost(data: TQueryPostData) {
  'use cache'

  const result = await getPost(data)

  if (result.success) {
    // If the post slug is changed, these caches shouldn't invalidate, because by invalidation it shows the error "Post not found" while the page is getting fresh data, so it's better show stale data instead of error while it's getting fresh data.
    if (data.type === 'draft') {
      cacheTag('post-draft-' + result.post.id)
    } else {
      cacheTag('post-' + result.post.id)
    }
  }

  return result
}
