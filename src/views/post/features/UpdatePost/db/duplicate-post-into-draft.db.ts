import {
  postErrors,
  type IPostDocument,
  type TDuplicatePostIntoDraftData,
  type TDuplicatePostIntoDraftResponse,
} from '../../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function duplicatePostIntoDraft(
  duplicatePostIntoDraftData: TDuplicatePostIntoDraftData,
): Promise<TDuplicatePostIntoDraftResponse> {
  const postsColl = await mongoManager.getCollection<IPostDocument>(
    COLLECTIONS.POSTS,
  )
  const postsDraftColl = await mongoManager.getCollection<IPostDocument>(
    COLLECTIONS.POSTS_DRAFT,
  )

  const { postGroupId } = duplicatePostIntoDraftData

  const postData = await postsColl.findOneAndUpdate(
    { post_group_id: postGroupId },
    { $set: { has_draft: true } },
    {
      returnDocument: 'after',
      projection: { _id: 0 },
    },
  )

  if (!postData) {
    return {
      success: false,
      errors: {
        general: postErrors['NOT_FOUND_POST_TO_DUPLICATE'].server,
        code: 'NOT_FOUND_POST_TO_DUPLICATE',
      },
    }
  }

  const postDraftData = await postsDraftColl.insertOne(postData)

  if (!postDraftData) {
    return {
      success: false,
      errors: {
        general: postErrors['DUPLICATE_POST_INTO_DRAFT_FAILURE'].server,
        code: 'DUPLICATE_POST_INTO_DRAFT_FAILURE',
      },
    }
  }

  return {
    success: true,
    post: {
      id: postDraftData.insertedId.toHexString(),
      title: postData.title,
      slug: postData.slug,
    },
  }
}
