import { Metadata } from 'next'

import { AddViewBrandsPage } from '@/views/brand'

export const metadata: Metadata = {
  title: 'Brands',
}

export default function Brands() {
  return <AddViewBrandsPage />
}
