import {
  IconFile,
  IconFileExcel,
  IconFileTypeCsv,
  IconFileTypeDoc,
  IconFileTypeDocx,
  IconFileTypeJpg,
  IconFileTypePdf,
  IconFileTypePng,
  IconFileTypePpt,
  IconFileTypeSvg,
  IconFileTypeTxt,
  IconFileTypeXls,
  IconFileTypeZip,
  IconFileUnknown,
  IconMovie,
  IconPhoto,
} from '@tabler/icons-react'

import { type TFileTypes } from './'

// Reading medias constants
export const ROOT = 'public'
export const HOME_DIRECTORY = 'assets'
export const THUMBNAIL_DIRECTORY = 'thumbnails'

// Validation constants
export const SMALL_FILE_LIMIT = 50 * 1024 * 1024 // buffer route limit (50MB)
export const LARGE_FILE_LIMIT = 2 * 1024 * 1024 * 1024 // streaming route limit (2GB)
export const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
]
export const DOC_EXTENSIONS = [
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pdf',
  '.txt',
  '.csv',
]
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov']
export const COMPRESS_EXTENSIONS = ['.zip', '.rar']
export const ALLOWED_EXTENSIONS = [
  ...IMAGE_EXTENSIONS,
  ...DOC_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
  ...COMPRESS_EXTENSIONS,
]

// Media preview icons
export const FILE_TYPE_ICON: Record<TFileTypes, typeof IconMovie | undefined> =
  {
    video: IconMovie,
    other: IconFile,
    document: IconFile,
    image: IconPhoto,
  }
export const EXTENSION_ICON: Record<string, typeof IconFileTypeJpg> = {
  '.jpg': IconFileTypeJpg,
  '.jpeg': IconFileTypeJpg,
  '.png': IconFileTypePng,
  '.svg': IconFileTypeSvg,
  '.pdf': IconFileTypePdf,
  '.doc': IconFileTypeDoc,
  '.docx': IconFileTypeDocx,
  '.ppt': IconFileTypePpt,
  '.txt': IconFileTypeTxt,
  '.xls': IconFileTypeXls,
  '.xlsx': IconFileExcel,
  '.csv': IconFileTypeCsv,
  '.zip': IconFileTypeZip,
  '.tmp': IconFileUnknown,
}
