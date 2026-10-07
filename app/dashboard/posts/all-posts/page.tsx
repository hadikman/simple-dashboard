import { Metadata } from 'next'

import { ViewPostsPage } from '@/views/post'

export const metadata: Metadata = {
  title: 'All Posts',
}

export default function AllPosts() {
  return <ViewPostsPage />
}
