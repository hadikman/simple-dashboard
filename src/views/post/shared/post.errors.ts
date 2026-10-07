import { type TPostErrorCode } from '../shared'

type ErrorConfig = {
  server: string
  client: string
  code: TPostErrorCode
}

export const postErrors = {
  DUPLICATE_SLUG: {
    server: 'Post Slug already exists in database',
    client: 'The Key is already in use.',
    code: 'DUPLICATE_SLUG',
  },
  FAILURE_DRAFT: {
    server: 'Failed to create new post draft in database',
    client: 'Could not add the post draft. Please try again.',
    code: 'FAILURE_DRAFT',
  },
  FAILURE: {
    server: 'Failed to create new post in database',
    client: 'Could not add the post. Please try again.',
    code: 'FAILURE',
  },
  EMPTY_POSTS: {
    server: 'No posts found in database',
    client: 'No Posts To Display',
    code: 'EMPTY_POSTS',
  },
  EMPTY_POSTS_DRAFT: {
    server: 'No posts draft found in database',
    client: 'No Posts Draft To Display',
    code: 'EMPTY_POSTS_DRAFT',
  },
  DELETE_DRAFT_FAILURE: {
    server: 'Failed to delete post draft from database',
    client: 'Could not delete the post draft. Please try again.',
    code: 'DELETE_DRAFT_FAILURE',
  },
  DELETE_FAILURE: {
    server: 'Failed to delete post from database',
    client: 'Could not delete the post. Please try again.',
    code: 'DELETE_FAILURE',
  },
  NOT_FOUND_POSTS_PROPS: {
    server: 'Posts properties not found',
    client: 'Posts properties not found',
    code: 'NOT_FOUND_POSTS_PROPS',
  },
  NOT_FOUND_POST: {
    server: 'Post not found',
    client: 'Post not found',
    code: 'NOT_FOUND_POST',
  },
  DUPLICATE_PROP: {
    server: 'Post value already exists in database',
    client: 'The value is already in use.',
    code: 'DUPLICATE_PROP',
  },
  UPDATE_FAILURE: {
    server: 'Failed to update post',
    client: 'Could not update the post. Please try again.',
    code: 'UPDATE_FAILURE',
  },
  NOT_FOUND_POST_TO_DUPLICATE: {
    server: 'Requested post not found to duplicate',
    client: 'Requested post not found to duplicate',
    code: 'NOT_FOUND_POST_TO_DUPLICATE',
  },
  DUPLICATE_POST_INTO_DRAFT_FAILURE: {
    server: 'Failed to duplicate the requested post into draft database',
    client: 'Could not duplicate the post into draft. Please try again.',
    code: 'DUPLICATE_POST_INTO_DRAFT_FAILURE',
  },
  UPDATE_POST_PROP_FAILURE: {
    server: 'Failed to update post prop',
    client: 'Could not update the post prop. Please try again.',
    code: 'UPDATE_POST_PROP_FAILURE',
  },
  DELETE_DRAFTS_FAILURE: {
    server: 'Failed to delete posts drafts from database',
    client: 'Could not delete the posts drafts. Please try again.',
    code: 'DELETE_DRAFTS_FAILURE',
  },
  DELETE_POSTS_FAILURE: {
    server: 'Failed to delete posts from database',
    client: 'Could not delete the posts. Please try again.',
    code: 'DELETE_POSTS_FAILURE',
  },
  COPY_FAILURE: {
    server: 'Failed to copy post',
    client: 'Could not make a copy of the post. Please try again.',
    code: 'COPY_FAILURE',
  },
} satisfies Record<TPostErrorCode, ErrorConfig>
