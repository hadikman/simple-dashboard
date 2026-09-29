import {
  type TFileTypes,
  ALLOWED_EXTENSIONS,
  DOC_EXTENSIONS,
  IMAGE_EXTENSIONS,
  LARGE_FILE_LIMIT,
  VIDEO_EXTENSIONS,
} from '../'

// Get human-readable file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i]
}

// Get validation rules for display
export function getValidationRules(): {
  maxSize: string
  allowedTypes: string[]
} {
  return {
    maxSize: formatFileSize(LARGE_FILE_LIMIT),
    allowedTypes: ALLOWED_EXTENSIONS.map(ext => ext.substring(1).toUpperCase()),
  }
}

export function getFilename(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  return dotIndex > 0 ? filename.slice(0, dotIndex) : ''
}

export function getFileExtension(filename: string): string {
  const lastDotIdx = filename.lastIndexOf('.')
  return lastDotIdx > 0 ? filename.slice(lastDotIdx).toLowerCase() : ''
}

export function getFileTypeFromExtension(extension: string): TFileTypes {
  if (IMAGE_EXTENSIONS.includes(extension.toLowerCase())) return 'image'
  if (DOC_EXTENSIONS.includes(extension.toLowerCase())) return 'document'
  if (VIDEO_EXTENSIONS.includes(extension.toLowerCase())) return 'video'
  return 'other'
}
