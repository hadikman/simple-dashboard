import { ObjectId } from 'mongodb'

import type { WithId } from '@/helpers/ts-utils'

import {
  postErrors,
  type IPostDocument,
  type TGetPostsPropsResponse,
  type TQueryPostsPropsData,
} from '../../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getPostsProps<
  T extends Partial<Record<keyof IPostDocument, unknown>>,
>(
  getPostsPropsData: TQueryPostsPropsData<T>,
): Promise<TGetPostsPropsResponse<T>> {
  const { keys, type } = getPostsPropsData
  const isDraftMode = type === 'draft'
  const selectedColl = isDraftMode ? COLLECTIONS.POSTS_DRAFT : COLLECTIONS.POSTS
  const collection =
    await mongoManager.getCollection<IPostDocument>(selectedColl)
  const cursor = collection.find()
  const projectCursor = cursor.project<T & { _id: ObjectId }>(keys)
  const data = await projectCursor.toArray()

  if (data.length === 0) {
    return {
      success: false,
      errors: {
        general: postErrors['NOT_FOUND_POSTS_PROPS'].server,
        code: 'NOT_FOUND_POSTS_PROPS',
      },
    }
  }

  const dataWithId = data.map(({ _id, ...rest }) => ({
    ...rest,
    id: _id.toHexString(),
  })) as unknown as WithId<T>[]

  return {
    success: true,
    posts: dataWithId,
  }
}
