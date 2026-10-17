import { Metadata } from 'next'

import { AddViewFeaturesPage } from '@/views/features'

export const metadata: Metadata = {
  title: 'Features',
}

export default function Features() {
  return <AddViewFeaturesPage />
}
