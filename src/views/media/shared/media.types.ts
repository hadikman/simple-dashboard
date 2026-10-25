import type { Prettify } from '@/helpers/ts-utils'

// Media interfaces & types
export type IUploadStatus =
  'pending' | 'uploading' | 'completed' | 'error' | 'cancelled'

export interface IUploadItem {
  id: string
  name: string
  size: number
  progress: number
  status: IUploadStatus
  file: File
  type: string
  error?: string
  xhr?: XMLHttpRequest
}

export interface IUploadBatch {
  total: number
  completed: number
  failed: number
  cancelled: number
  revalidated: boolean
}

export interface IFileInfo {
  filePath: string
  publicPath: string
  extension: string
  name: string
  filename: string
  thumbnail: string
  isDirectory: boolean
  createdAt: Date
  modifiedAt: Date
  size: number
  accessedAt: Date
}

export type TFileTypes = 'image' | 'video' | 'document' | 'other'

export interface IResultFilesValidation {
  validFiles: File[]
  invalidFiles: { file: File; error: IFileValidation }[]
}

export type TFileErrorCode =
  | 'EMPTY_LIBRARY'
  | 'EMPTY_FILE'
  | 'NO_FILE'
  | 'DELETE_FAILURE'
  | 'DISK_FULL_SPACE'
  | 'UPLOAD_FAILURE'
  | 'INVALID_FORMAT'
  | 'SIZE_EXCEEDED'

export interface IFileValidation {
  general?: string | undefined
  code?: TFileErrorCode | undefined
}

// Upload Files
export type TGetFilesFromDir = {
  directoryPath: string
  extensions?: string[]
  sortBy?: 'name' | 'date' | 'size'
  sortOrder?: 'asc' | 'desc'
}

export type TUploadFilesResponse =
  | {
      success: true
      data:
        | {
            filename: string
            originalName: string
            fileUrl: string
            size: number
            type: string
            uploadedAt: Date
          }
        | string
    }
  | {
      success: false
      errors: IFileValidation
    }

// Get Files
export type TGetFilesResponse =
  | {
      success: true
      files: IFileInfo[]
    }
  | {
      success: false
      errors: IFileValidation
    }

// Delete File
export type TDeleteFileAction = Prettify<
  Omit<TDeleteFileData, 'thumbPath'> & {
    thumbnail: string
  }
>

export type TDeleteFileData = {
  filePath: string
  thumbPath: string
}

export type TDeleteFileResponse =
  | {
      success: true
      filePath: string
      thumbPath?: string
    }
  | {
      success: false
      errors: IFileValidation
    }
