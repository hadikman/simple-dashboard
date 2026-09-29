'use client'

import { TrashIcon } from 'lucide-react'
import { toast } from 'sonner'

import {
  type TDeleteFileAction,
  deleteFileAction,
  mediaErrors,
} from '../../../shared/'

import { Button } from '@/components/ui/button'
import { deleteConfirmation } from '@/helpers/confirmation-utils'
import { withMinDelay } from '@/helpers/utils'

export function DeleteMediaFile(deleteFileData: TDeleteFileAction) {
  async function handleClick() {
    const { filePath } = deleteFileData
    const index = filePath.lastIndexOf('\\')
    const filename = filePath.slice(index + 1, filePath.length)

    const confirmed = await deleteConfirmation(filename)
    if (!confirmed) return

    const result = await toast
      .promise(withMinDelay(deleteFileAction(deleteFileData), 500), {
        loading: 'Deleting file...',
        error: 'Failed to delete file. Please try again.',
      })
      .unwrap()
    if (result.success) {
      toast.success(`The ${filename} has been deleted`, {
        duration: 2000,
      })
    } else {
      toast.error('Failure to delete file', {
        description: result.errors.code
          ? mediaErrors[result.errors.code].client
          : 'Please try again!',
        duration: 3000,
      })
    }
  }

  return (
    <Button
      className="absolute -top-2.5 -right-2.5 z-10 rounded-full opacity-0 group-hover/file:opacity-100"
      variant="destructive"
      size="icon-xs"
      onClick={e => {
        e.stopPropagation()
        handleClick()
      }}
    >
      <TrashIcon />
    </Button>
  )
}
