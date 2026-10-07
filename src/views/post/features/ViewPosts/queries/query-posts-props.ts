'use server'

import { cacheTag } from 'next/cache'

import { type TQueryPostsPropsData } from '../../../shared'

import { getPostsProps } from '../db/get-posts-props.db'

export async function queryPostsProps<T>(data: TQueryPostsPropsData<T>) {
  'use cache'

  const result = await getPostsProps(data)

  if (result.success) {
    if (data.type === 'draft') {
      cacheTag('posts-props-draft')
    } else {
      cacheTag('posts-props')
    }
  }

  return result
}
