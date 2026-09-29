import { execFile } from 'child_process'
import { access, mkdir } from 'fs/promises'
import path from 'path'

import { getFilename, HOME_DIRECTORY, ROOT, THUMBNAIL_DIRECTORY } from '../'

import { generateId } from '@/helpers/utils'

export const UPLOAD_DIR = path.join(process.cwd(), ROOT, HOME_DIRECTORY)
export const THUMBNAIL_DIR = path.join(UPLOAD_DIR, THUMBNAIL_DIRECTORY)

type GenerateVideoThumbnailProps = {
  videoPath: string
  thumbPath: string
  atSeconds?: number
}
export async function generateVideoThumbnail({
  videoPath,
  thumbPath,
  atSeconds = 2,
}: GenerateVideoThumbnailProps) {
  return new Promise((resolve, reject) => {
    execFile(
      'ffmpeg',
      [
        '-y', // overwrite
        '-i',
        videoPath,
        '-ss',
        `${atSeconds}`, // seek to 1s
        '-frames:v',
        '1', // capture 1 frame
        '-vf',
        'scale=320:-1', // keep aspect ratio
        thumbPath,
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any) => (err ? reject(err) : resolve(thumbPath)),
    )
  })
}

export async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true })
}

export async function exists(p: string) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

export function dosSafeBaseName(name: string) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .replace(/\.+$/g, '')
}

export function generateUniqueFilename(name: string, ext: string): string {
  return `${name}-${generateId()}${ext}`
}

export function generateThumbName(name: string) {
  return getFilename(name) + '.jpg'
}
