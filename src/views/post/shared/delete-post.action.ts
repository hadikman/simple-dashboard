'use server'

import { revalidateTag, updateTag } from 'next/cache'

import { type TDeletePostData } from '../shared'
import { deletePublishedSlugCache } from '../shared/server'

import { deletePost } from './db/delete.post.db'

export async function deletePostAction(data: TDeletePostData) {
  const result = await deletePost(data)

  if (result.success) {
    if (data.onlyDeleteDraft) {
      updateTag('post-draft-' + result.post.id)
      updateTag('posts-props-draft')
      updateTag('posts-draft-list')
    } else {
      updateTag('post-' + result.post.id)
      updateTag('posts-props')
      updateTag('posts-list')
      revalidateTag('posts-for-linking-list', 'max')

      deletePublishedSlugCache(data.postGroupId)
    }
  }

  return result
}
