import { ObjectId } from 'mongodb'

import {
  postErrors,
  type IPostDocument,
  type TDeletePostData,
  type TDeletePostResponse,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function deletePost(
  deletePostData: TDeletePostData,
): Promise<TDeletePostResponse> {
  const postsColl = await mongoManager.getCollection<IPostDocument>(
    COLLECTIONS.POSTS,
  )
  const postsDraftColl = await mongoManager.getCollection<IPostDocument>(
    COLLECTIONS.POSTS_DRAFT,
  )
  const { id, postGroupId, title, hasDraft, onlyDeleteDraft } = deletePostData

  if (hasDraft) {
    const data = await postsDraftColl.deleteOne({
      post_group_id: postGroupId,
    })

    if (!data) {
      return {
        success: false,
        errors: {
          general: postErrors['DELETE_DRAFT_FAILURE'].server,
          code: 'DELETE_DRAFT_FAILURE',
        },
      }
    }
  }

  if (onlyDeleteDraft) {
    return {
      success: true,
      post: { id, title },
    }
  }

  const data = await postsColl.deleteOne({
    post_group_id: postGroupId,
  })

  if (!data) {
    return {
      success: false,
      errors: {
        general: postErrors['DELETE_FAILURE'].server,
        code: 'DELETE_FAILURE',
      },
    }
  }

  const objectId = new ObjectId(id)
  await postsColl.updateMany(
    { 'linked_posts.related': objectId },
    { $pull: { 'linked_posts.related': objectId } },
  )

  return {
    success: true,
    post: { id, title },
  }
}
