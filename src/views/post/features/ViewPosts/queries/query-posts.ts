'use server'

import { cacheTag } from 'next/cache'

import { type TQueryPostsData } from '../../../shared'

import { getPosts } from '../db/get-posts.db'

export async function queryPosts(data: TQueryPostsData) {
  'use cache'

  const result = await getPosts(data)

  if (result.success) {
    if (data.type === 'draft') {
      cacheTag('posts-draft-list')
    } else {
      cacheTag('posts-list')
    }
  }

  return result
}
