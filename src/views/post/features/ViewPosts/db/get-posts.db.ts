import {
  postErrors,
  type IPostDocument,
  type IPostLookupDocument,
  type TGetPostsResponse,
  type TPostLookupDataWithId,
  type TQueryPostsData,
} from '../../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getPosts(
  getPostsData: TQueryPostsData,
): Promise<TGetPostsResponse> {
  const { type } = getPostsData
  const isDraftMode = type === 'draft'
  const selectedColl = isDraftMode ? COLLECTIONS.POSTS_DRAFT : COLLECTIONS.POSTS
  const collection =
    await mongoManager.getCollection<IPostDocument>(selectedColl)

  const lookedupData = (await collection
    .aggregate([
      { $match: {} },

      {
        $lookup: {
          from: COLLECTIONS.USERS,
          localField: 'author_id',
          foreignField: '_id',
          as: 'author_data',
        },
      },
      { $unwind: '$author_data' },
      { $addFields: { author_name: '$author_data.username' } },
      { $unset: 'author_data' },

      {
        $lookup: {
          from: COLLECTIONS.CATEGORY,
          localField: 'categories',
          foreignField: '_id',
          pipeline: [
            { $match: { category_group: 'posts' } },
            { $project: { name: 1 } },
          ],
          as: 'categories_data',
        },
      },
      { $addFields: { categories: '$categories_data' } },
      { $unset: 'categories_data' },

      {
        $lookup: {
          from: COLLECTIONS.POSTS,
          localField: 'linked_posts.related',
          foreignField: '_id',
          let: { status: '$status' },
          pipeline: [
            { $match: { $expr: { $eq: ['$status', 'published'] } } },
            { $project: { post_group_id: 1, title: 1 } },
            { $sort: { _id: -1 } },
          ],
          as: 'linked_post_related_data',
        },
      },
      {
        $addFields: {
          'linked_posts.related': '$linked_post_related_data',
        },
      },
      { $unset: 'linked_post_related_data' },

      { $project: { schema_version: 0 } },
      { $sort: { _id: -1 } },
    ])
    .toArray()) as IPostLookupDocument[]

  if (lookedupData.length === 0) {
    return {
      success: false,
      errors: {
        general: postErrors['EMPTY_POSTS'].server,
        code: 'EMPTY_POSTS',
      },
    }
  }

  const lookedupDataWithId: TPostLookupDataWithId[] = lookedupData.map(
    ({ _id, author_id, categories, linked_posts: { related }, ...rest }) => ({
      id: _id.toHexString(),
      author_id: author_id.toHexString(),
      categories: categories.length
        ? categories.map(({ _id, name }) => ({ id: _id.toHexString(), name }))
        : [],
      linked_posts: {
        related: related
          ? related.map(({ _id, post_group_id, title }) => ({
              id: _id.toHexString(),
              post_group_id,
              title,
            }))
          : [],
      },
      ...rest,
    }),
  )

  return {
    success: true,
    posts: lookedupDataWithId,
  }
}
