import { DeleteResult, ObjectId } from 'mongodb'

import {
  type IPostDocument,
  type TDeletePostsData,
  type TDeletePostsResponse,
  postErrors,
} from '../../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function deletePosts(
  deletePostData: TDeletePostsData,
): Promise<TDeletePostsResponse> {
  const postsColl = await mongoManager.getCollection<IPostDocument>(
    COLLECTIONS.POSTS,
  )
  const postsDraftColl = await mongoManager.getCollection<IPostDocument>(
    COLLECTIONS.POSTS_DRAFT,
  )
  let data: DeleteResult = { acknowledged: false, deletedCount: 0 },
    draftData: DeleteResult = { acknowledged: false, deletedCount: 0 }

  const [posts, onlyDrafts, postsForUpdate] = deletePostData.reduce<
    [TDeletePostsData, TDeletePostsData, TDeletePostsData]
  >(
    (acc, cur) => {
      if (cur.hasDraft && !cur.isPublished) {
        acc[0].push(cur) // Audit (published)
        acc[1].push(cur) //  Audit (draft)
      } else if (cur.onlyDeleteDraft) {
        acc[1].push(cur) // Draft
        acc[2].push(cur) // Add post to update has_draft
      } else {
        acc[0].push(cur) // Published
      }

      return acc
    },
    [[], [], []],
  )

  if (posts.length) {
    const [postsObjectIds, postsGroupIds] = posts.reduce<
      [ObjectId[], string[]]
    >(
      (acc, cur) => {
        acc[0].push(new ObjectId(cur.id))
        acc[1].push(cur.postGroupId)

        return acc
      },
      [[], []],
    )

    data = await postsColl.deleteMany({
      post_group_id: { $in: postsGroupIds },
    })

    if (!data) {
      return {
        success: false,
        errors: {
          general: postErrors['DELETE_POSTS_FAILURE'].server,
          code: 'DELETE_POSTS_FAILURE',
        },
      }
    }

    await postsColl.updateMany(
      { 'linked_posts.related': { $in: postsObjectIds } },
      {
        $pull: {
          'linked_posts.related': { $in: postsObjectIds },
        },
      },
    )
  }

  if (onlyDrafts.length) {
    const postsGroupIds = onlyDrafts.map(({ postGroupId }) => postGroupId)
    draftData = await postsDraftColl.deleteMany({
      post_group_id: { $in: postsGroupIds },
    })

    if (!draftData) {
      return {
        success: false,
        errors: {
          general: postErrors['DELETE_DRAFTS_FAILURE'].server,
          code: 'DELETE_DRAFTS_FAILURE',
        },
      }
    }
  }

  if (postsForUpdate.length) {
    const postGroupIds = postsForUpdate.map(({ postGroupId }) => postGroupId)
    await postsColl.updateMany(
      { post_group_id: { $in: postGroupIds } },
      { $set: { has_draft: false } },
    )
  }

  const deleteCount = data.deletedCount + draftData.deletedCount

  return {
    success: true,
    deleteCount,
  }
}
