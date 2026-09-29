import { unlink } from 'fs/promises'

import {
  type TDeleteFileData,
  type TDeleteFileResponse,
  mediaErrors,
} from '../'

export async function deleteFile(
  deleteFileData: TDeleteFileData,
): Promise<TDeleteFileResponse> {
  const { filePath, thumbPath } = deleteFileData

  try {
    await unlink(filePath)

    if (thumbPath) await unlink(thumbPath)

    return {
      success: true,
      filePath,
      thumbPath,
    }
  } catch (error) {
    return {
      success: false,
      errors: {
        general: mediaErrors['DELETE_FAILURE'].server,
        code: 'DELETE_FAILURE',
      },
    }
  }
}
