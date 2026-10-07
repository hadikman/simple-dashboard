import { ObjectId } from 'mongodb'

import {
  type ILinkedPosts,
  type IPostAdvanced,
  type IPostDocument,
  type TAddPostResponse,
  type TPostData,
  postErrors,
} from '../../shared'

import { mongoManager } from '@/config/db/MongoManager'
import { getCurrentUTCDate } from '@/helpers/utils'

export async function addPost(postData: TPostData): Promise<TAddPostResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const postsColl = db.collection<IPostDocument>(mongoManager.POSTS_COLL)
  const postsDraftColl = db.collection<IPostDocument>(
    mongoManager.POSTS_DRAFT_COLL,
  )

  const { author_id, categories, has_draft, linked_posts, advanced } = postData
  const currentUTCDate = getCurrentUTCDate()

  const postGroupId = crypto.randomUUID().split('-')[0]
  const authorObjectId = new ObjectId(author_id)
  const categoriesObjectIdOrEmptyArr = categories.length
    ? categories.map(id => new ObjectId(id))
    : []
  const linkedPostsObjectIdOrEmptyArr: ILinkedPosts = {
    related: linked_posts.related.map(id => new ObjectId(id)) ?? [],
  }
  const advancedWithModifiedProps: IPostAdvanced = {
    ...advanced,
    scheduled_publish: advanced.scheduled_publish
      ? currentUTCDate
      : advanced.scheduled_publish,
  }

  const AddPostDoc: IPostDocument = {
    ...postData,
    schema_version: 1.0,

    post_group_id: postGroupId,

    author_id: authorObjectId,
    categories: categoriesObjectIdOrEmptyArr,
    comments: [],
    comment_count: 0,
    view_count: 0,
    linked_posts: linkedPostsObjectIdOrEmptyArr,
    advanced: advancedWithModifiedProps,
    published_at: postData.is_published ? currentUTCDate : null,
    created_at: currentUTCDate,
    updated_at: null,
  }

  if (has_draft) {
    const data = await postsDraftColl.insertOne(AddPostDoc)

    if (!data) {
      return {
        success: false,
        errors: {
          general: postErrors['FAILURE_DRAFT'].server,
          code: 'FAILURE_DRAFT',
        },
      }
    }
  }

  const data = await postsColl.insertOne(AddPostDoc)

  if (!data) {
    return {
      success: false,
      errors: {
        general: postErrors['FAILURE'].server,
        code: 'FAILURE',
      },
    }
  }

  return {
    success: true,
    post: {
      id: data.insertedId.toHexString(),
      post_group_id: postGroupId,
    },
  }
}
