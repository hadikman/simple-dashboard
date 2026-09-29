import React from 'react'

import { getFilesFromDirAction } from '../shared'

import { Spinner } from '@/components/ui/spinner'
import { MediaUploadPanel } from './components/MediaUploadPanel'
import { PreviewMediaFilesPanel } from './components/PreviewMediaFilesPanel'

export function MediaPage() {
  const filesData = React.use(getFilesFromDirAction())

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <MediaUploadPanel />
      <React.Suspense fallback={<Spinner />}>
        <PreviewMediaFilesPanel filesData={filesData} />
      </React.Suspense>
    </div>
  )
}
