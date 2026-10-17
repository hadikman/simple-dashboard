import type { Metadata } from 'next'

import { CategoryPage } from '@/views/category'

export const metadata: Metadata = {
  title: 'Products Category',
}

export default function Category() {
  return <CategoryPage categoryGroup="products" />
}
