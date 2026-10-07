import { FindCursor } from 'mongodb'

import {
  postErrors,
  type ILinkedPostLookup,
  type IPostDocument,
  type TGetPostsForLinkingResponse,
  type TLinkedPostLookupWithId,
} from '../../../shared'

import { mongoManager } from '@/config/db/MongoManager'

export async function getPostsForLinking(): Promise<TGetPostsForLinkingResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IPostDocument>(mongoManager.POSTS_COLL)

  const cursor = collection.find({ status: 'published' })
  const projectCursor = cursor.sort({ _id: -1 }).project({
    post_group_id: 1,
    title: 1,
  }) as unknown as FindCursor<ILinkedPostLookup>
  const data = await projectCursor.toArray()

  if (data.length === 0) {
    return {
      success: false,
      errors: {
        general: postErrors['EMPTY_POSTS'].server,
        code: 'EMPTY_POSTS',
      },
    }
  }

  const dataWithId = data.map(({ _id, ...rest }) => ({
    id: _id.toHexString(),
    ...rest,
  })) as unknown as TLinkedPostLookupWithId[]

  return {
    success: true,
    posts: dataWithId,
  }
}
