import type { Metadata } from 'next'

import { CategoryPage } from '@/views/category'

export const metadata: Metadata = {
  title: 'Posts Category',
}

export default function Category() {
  return <CategoryPage categoryGroup="posts" />
}
