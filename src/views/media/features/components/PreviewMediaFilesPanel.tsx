import { BananaIcon } from 'lucide-react'

import { type TGetFilesResponse, mediaErrors } from '../../shared'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { PreviewMediaFiles } from './ui/PreviewMediaFiles'

type PreviewMediaFilesPanelProps = { filesData: TGetFilesResponse }
export async function PreviewMediaFilesPanel({
  filesData,
}: PreviewMediaFilesPanelProps) {
  const { success } = filesData

  return success ? (
    <PreviewMediaFiles files={filesData.files} />
  ) : (
    // Only displayed when no file exists
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BananaIcon />
        </EmptyMedia>
        <EmptyTitle>
          {!success && filesData?.errors?.code
            ? mediaErrors[filesData.errors.code].client
            : 'Empty Library, Upload A New File.'}
        </EmptyTitle>
        <EmptyDescription>
          You haven&apos;t uploaded any files yet. You can start by uploading
          your first file from the{' '}
          <span className="font-medium">&quot;Upload&quot;</span> panel.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
