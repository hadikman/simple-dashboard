import { Metadata } from 'next'

import { MediaPage } from '@/views/media'

export const metadata: Metadata = {
  title: 'Media',
}

export default function Media() {
  return <MediaPage />
}
