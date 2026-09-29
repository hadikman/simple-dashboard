'use server'

import { updateTag } from 'next/cache'
import path from 'path'

import { type TDeleteFileAction } from '../'
import { THUMBNAIL_DIR } from '../server'

import { deleteFile } from '../disk-io/delete-file'

export async function deleteFileAction(deleteFileData: TDeleteFileAction) {
  const { filePath, thumbnail } = deleteFileData
  let thumbPath = ''

  if (thumbnail) {
    thumbPath = path.join(THUMBNAIL_DIR, thumbnail)
  }

  const result = await deleteFile({ filePath, thumbPath })

  if (result.success) {
    updateTag('files')
  }

  return result
}
