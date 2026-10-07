import { ObjectId } from 'mongodb'

import {
  postErrors,
  type IPostAdvanced,
  type IPostDocument,
  type TUpdatePostData,
  type TUpdatePostResponse,
} from '../../../shared'

import { mongoManager } from '@/config/db/MongoManager'
import { getCurrentUTCDate, isString } from '@/helpers/utils'

export async function updatePost(
  updatePostData: TUpdatePostData,
): Promise<TUpdatePostResponse> {
  const { id, post_group_id, author_id, categories, linked_posts, ...rest } =
    updatePostData
  const isPublishedMode = updatePostData.status === 'published'

  const db = await mongoManager.getConnectedDatabase()
  const selectedColl = isPublishedMode
    ? mongoManager.POSTS_COLL
    : mongoManager.POSTS_DRAFT_COLL
  const collection = db.collection<IPostDocument>(selectedColl)

  const scheduled_publish = updatePostData.advanced?.scheduled_publish
  const advanced_scheduled_publish = scheduled_publish as
    IPostAdvanced['scheduled_publish'] | string // Type string used for making value null, if updated value is ''

  const userObjectId = new ObjectId(author_id)

  const categoriesObjectIdOrUndefined = categories
    ? categories.length
      ? categories.map(id => new ObjectId(id))
      : []
    : undefined

  const advancedScheduledPublishOrUndefined = isString(
    advanced_scheduled_publish,
  )
    ? advanced_scheduled_publish.length
      ? advanced_scheduled_publish
      : null
    : undefined

  const LPRelatedObjectIdOrUndefined = linked_posts?.related
    ? linked_posts.related.length
      ? linked_posts.related.map(id => new ObjectId(id))
      : []
    : undefined

  const currentUTCDate = getCurrentUTCDate()

  // For unchanged props, used undefined to ignore them, for changed props with cleared value, used null
  const updatePostDoc = {
    ...rest,

    author_id: userObjectId,

    ...(passIfNotUndefined(categoriesObjectIdOrUndefined) && {
      categories: categoriesObjectIdOrUndefined,
    }),

    ...(passIfNotUndefined(LPRelatedObjectIdOrUndefined) && {
      'linked_posts.related': LPRelatedObjectIdOrUndefined,
    }),

    ...(passIfNotUndefined(advancedScheduledPublishOrUndefined) && {
      'advanced.scheduled_publish': advancedScheduledPublishOrUndefined,
    }),
    ...(isPublishedMode && {
      published_at: currentUTCDate,
      updated_at: currentUTCDate,
    }),
    ...(!isPublishedMode && {
      updated_at: currentUTCDate,
    }),
  }

  const mongoUpdateData: Record<string, unknown> = {}

  function generateMongoUpdateObjByRecursive(data: object, parentKey?: string) {
    Object.entries(data).forEach(([key, value]) => {
      const finalKey = parentKey ? `${parentKey}.${key}` : key

      if (value === null) {
        mongoUpdateData[finalKey] = value
        return
      }

      if (value instanceof ObjectId) {
        return (mongoUpdateData[finalKey] = value)
      }

      if (value instanceof Date) {
        mongoUpdateData[finalKey] = value
        return
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        generateMongoUpdateObjByRecursive(value, finalKey)
        return
      }

      if (parentKey) {
        mongoUpdateData[finalKey] = value
        return
      }

      mongoUpdateData[finalKey] = value
    })
  }

  generateMongoUpdateObjByRecursive(updatePostDoc)

  const data = await collection.findOneAndUpdate(
    { post_group_id },
    { $set: mongoUpdateData },
    { returnDocument: 'after' },
  )

  if (!data) {
    return {
      success: false,
      errors: {
        general: postErrors['UPDATE_FAILURE'].server,
        code: 'UPDATE_FAILURE',
      },
    }
  }

  return {
    success: true,
    post: { id, slug: rest.slug || '' },
  }
}

function passIfNotUndefined<T>(value: T): boolean {
  return value !== undefined
}
