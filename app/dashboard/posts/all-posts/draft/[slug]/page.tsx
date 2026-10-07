import React from 'react'

import {
  getUserQueryOptions,
  UserIdHydrationBoundary,
} from '@/views/authentication'

import { queryPostsProps, UpdatePostPage } from '@/views/post'

import { SEGMENT_PLACEHOLDER } from '@/constants/common.constants'
import { isString } from '@/helpers/utils'

async function getPostsProps() {
  return await queryPostsProps({
    keys: { post_group_id: true, title: true, slug: true },
    type: 'draft',
  })
}

export async function generateStaticParams() {
  const postsProps = await getPostsProps()

  if (postsProps.success) {
    const { posts } = postsProps
    if (posts.length > 0) {
      return posts.map(({ slug }) => ({ slug }))
    }
  }

  return [{ src: SEGMENT_PLACEHOLDER }]
}

export async function generateMetadata({
  searchParams,
}: PageProps<'/dashboard/posts/all-posts/draft/[slug]'>) {
  const queries = await searchParams
  const queryGroupId = queries['group-id']
  const postsProps = await getPostsProps()

  if (postsProps.success) {
    const post = postsProps.posts.find(
      ({ post_group_id }) => post_group_id === queryGroupId,
    )

    return {
      title: post?.title,
    }
  }

  return {
    title: 'Unknown Post Draft',
  }
}

export default function Post({
  params,
  searchParams,
}: PageProps<'/dashboard/posts/all-posts/draft/[slug]'>) {
  const { slug } = React.use(params)
  const queries = React.use(searchParams)
  const queryGroupId = queries['group-id']
  const qroupIdString = isString(queryGroupId) ? queryGroupId : ''

  return (
    <UserIdHydrationBoundary queryOptions={getUserQueryOptions}>
      {userId => (
        <UpdatePostPage
          userId={userId}
          groupId={qroupIdString}
          postPageSlug={slug}
          postPageType="draft"
        />
      )}
    </UserIdHydrationBoundary>
  )
}
