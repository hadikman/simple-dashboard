import {
  type IFileValidation,
  type IResultFilesValidation,
  ALLOWED_EXTENSIONS,
  LARGE_FILE_LIMIT,
  mediaErrors,
} from './'

import { getFileExtension } from '@/helpers/utils'

// Main validation function
export function validateFile(file: File): IFileValidation | null {
  // Size validation
  if (file.size > LARGE_FILE_LIMIT) {
    return {
      general: mediaErrors['SIZE_EXCEEDED'].server,
      code: 'SIZE_EXCEEDED',
    }
  }

  // Type validation
  const extension = getFileExtension(file.name)
  const isAllowedExtension = ALLOWED_EXTENSIONS.includes(
    extension.toLowerCase(),
  )

  if (!isAllowedExtension) {
    return {
      general: mediaErrors['INVALID_FORMAT'].client,
      code: 'INVALID_FORMAT',
    }
  }

  // Additional check for empty file
  if (file.size === 0) {
    return {
      general: mediaErrors['EMPTY_FILE'].client,
      code: 'EMPTY_FILE',
    }
  }

  return null
}

// Validate multiple files
export function validateFiles(files: File[]): IResultFilesValidation {
  const validFiles: File[] = []
  const invalidFiles: { file: File; error: IFileValidation }[] = []

  files.forEach(file => {
    const error = validateFile(file)
    if (error) {
      invalidFiles.push({ file, error })
    } else {
      validFiles.push(file)
    }
  })

  return { validFiles, invalidFiles }
}
