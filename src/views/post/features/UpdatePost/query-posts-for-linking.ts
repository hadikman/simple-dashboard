'use server'

import { cacheTag } from 'next/cache'

import { getPostsForLinking } from './db/get-posts-for-linking.db'

export async function queryPostsForLinking() {
  'use cache'

  const result = await getPostsForLinking()

  if (result.success) {
    cacheTag('posts-for-linking-list')
  }

  return result
}
