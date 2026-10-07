import { ObjectId } from 'mongodb'

import type { WithId } from '@/helpers/ts-utils'

import {
  postErrors,
  type IPostDocument,
  type TGetPostsPropsResponse,
  type TQueryPostsPropsData,
} from '../../../shared'

import { mongoManager } from '@/config/db/MongoManager'

export async function getPostsProps<
  T extends Partial<Record<keyof IPostDocument, unknown>>,
>(
  getPostsPropsData: TQueryPostsPropsData<T>,
): Promise<TGetPostsPropsResponse<T>> {
  const db = await mongoManager.getConnectedDatabase()
  const { keys, type } = getPostsPropsData
  const isDraftMode = type === 'draft'
  const selectedColl = isDraftMode
    ? mongoManager.POSTS_DRAFT_COLL
    : mongoManager.POSTS_COLL
  const collection = db.collection<IPostDocument>(selectedColl)

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
