import { mkdir, readdir, stat } from 'fs/promises'
import path from 'path'

import {
  type TGetFilesFromDir,
  type TGetFilesResponse,
  HOME_DIRECTORY,
  mediaErrors,
  VIDEO_EXTENSIONS,
} from '../'

export async function getFilesFromDir({
  directoryPath,
  extensions = [],
  sortBy = 'date',
  sortOrder = 'desc',
}: TGetFilesFromDir): Promise<TGetFilesResponse> {
  // Recursively verify/create the target path before scanning
  await mkdir(directoryPath, { recursive: true })

  const files = await readdir(directoryPath, { withFileTypes: true })

  const normalizedExtensions = extensions.map(ext => ext.toLowerCase())

  const fileInfos = await Promise.all(
    files.map(async file => {
      const fullPath = path.join(directoryPath, file.name)
      const publicPath = `/${HOME_DIRECTORY}/${file.name}`
      const extension = path.extname(file.name).toLowerCase()
      const name = path.basename(file.name, extension)
      const isDirectory = file.isDirectory()
      const stats = await stat(fullPath)

      let thumbnail = ''

      const isVideo = VIDEO_EXTENSIONS.includes(extension)
      if (isVideo) {
        thumbnail = name + '.jpg'
      }

      return {
        filePath: fullPath,
        publicPath,
        extension,
        name,
        filename: file.name,
        thumbnail,
        isDirectory,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        size: stats.size,
        accessedAt: stats.atime,
      }
    }),
  )

  const filteredFiles = normalizedExtensions.length
    ? fileInfos.filter(file => normalizedExtensions.includes(file.extension))
    : fileInfos

  if (filteredFiles.length === 0) {
    return {
      success: false,
      errors: {
        general: mediaErrors['EMPTY_LIBRARY'].server,
        code: 'EMPTY_LIBRARY',
      },
    }
  }

  const sortedFiles = filteredFiles.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)

      case 'date':
        return sortOrder === 'desc'
          ? b.modifiedAt.getTime() - a.modifiedAt.getTime() // Newest first
          : a.modifiedAt.getTime() - b.modifiedAt.getTime() // Oldest first

      case 'size':
        return sortOrder === 'desc'
          ? b.size - a.size // Largest first
          : a.size - b.size // Smallest first

      default:
        return b.modifiedAt.getTime() - a.modifiedAt.getTime()
    }
  })

  return {
    success: true,
    files: sortedFiles,
  }
}
