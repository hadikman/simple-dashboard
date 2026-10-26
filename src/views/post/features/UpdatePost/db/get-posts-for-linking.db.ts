import { FindCursor } from 'mongodb'

import {
  type ILinkedPostLookup,
  type IPostDocument,
  type TGetPostsForLinkingResponse,
  type TLinkedPostLookupWithId,
  postErrors,
} from '../../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getPostsForLinking(): Promise<TGetPostsForLinkingResponse> {
  const collection = await mongoManager.getCollection<IPostDocument>(
    COLLECTIONS.POSTS,
  )

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
