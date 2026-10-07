import React from 'react'

import {
  getUserQueryOptions,
  UserIdHydrationBoundary,
} from '@/views/authentication'

import { queryPostsProps, UpdatePostPage } from '@/views/post'

import { SEGMENT_PLACEHOLDER } from '@/constants/common.constants'

async function getPostsProps() {
  return await queryPostsProps({ keys: { title: true, slug: true } })
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
  params,
}: PageProps<'/dashboard/posts/all-posts/[slug]'>) {
  const { slug } = await params
  const postsProps = await getPostsProps()

  if (postsProps.success) {
    const post = postsProps.posts.find(p => p.slug === slug)

    return {
      title: post?.title,
    }
  }

  return {
    title: 'Unknown Post',
  }
}

export default function Post({
  params,
}: PageProps<'/dashboard/posts/all-posts/[slug]'>) {
  const { slug } = React.use(params)

  return (
    <UserIdHydrationBoundary queryOptions={getUserQueryOptions}>
      {userId => (
        <UpdatePostPage
          userId={userId}
          postPageSlug={slug}
          postPageType="published"
        />
      )}
    </UserIdHydrationBoundary>
  )
}
