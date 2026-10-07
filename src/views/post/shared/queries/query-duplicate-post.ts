'use server'

import { type TQueryDuplicatePostData } from '../../shared'

import { checkDuplicatePost } from '../db/check-duplicate-post.db'

export async function queryDuplicatePost(data: TQueryDuplicatePostData) {
  return await checkDuplicatePost(data)
}
