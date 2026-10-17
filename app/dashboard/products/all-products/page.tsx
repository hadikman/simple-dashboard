import { Metadata } from 'next'

import { ViewProductsPage } from '@/views/product'

export const metadata: Metadata = {
  title: 'All Products',
}

export default function AllProducts() {
  return <ViewProductsPage />
}
