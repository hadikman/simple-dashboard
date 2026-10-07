'use server'

import { revalidateTag, updateTag } from 'next/cache'

import { type TDeletePostsData } from '../../shared'
import { deletePublishedSlugCache } from '../../shared/server'

import { deletePosts } from './db/delete.posts.db'

export async function deletePostsAction(deletePostsData: TDeletePostsData) {
  const result = await deletePosts(deletePostsData)

  if (result.success) {
    deletePostsData.forEach(
      ({ id, hasDraft, isPublished, onlyDeleteDraft, postGroupId }) => {
        if (hasDraft && !isPublished) {
          // Audit
          updateTag('post-draft-' + id)
        } else if (onlyDeleteDraft) {
          // Draft & published version
          updateTag('post-draft-' + id)
          updateTag('post-' + id)
        } else {
          // Published
          updateTag('post-' + id)

          deletePublishedSlugCache(postGroupId)
        }
      },
    )

    if (deletePostsData.some(({ hasDraft }) => hasDraft)) {
      updateTag('posts-props-draft')
      updateTag('posts-draft-list')
    }

    updateTag('posts-props')
    updateTag('posts-list')
    revalidateTag('posts-for-linking-list', 'max')
  }

  return result
}
