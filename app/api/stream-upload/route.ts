import Busboy from 'busboy'
import fs from 'fs'
import fsp from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'

import { generateId } from '@/helpers/utils'
import {
  getFileTypeFromExtension,
  mediaErrors,
  TUploadFilesResponse,
} from '@/views/media'
import {
  dosSafeBaseName,
  ensureDir,
  exists,
  generateThumbName,
  generateUniqueFilename,
  generateVideoThumbnail,
  THUMBNAIL_DIR,
  UPLOAD_DIR,
} from '@/views/media/server'

export async function POST(
  req: NextRequest,
): Promise<NextResponse<TUploadFilesResponse>> {
  await ensureDir(UPLOAD_DIR)

  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: Object.fromEntries(req.headers) })

    let finalFilePath = ''
    let originalName = ''
    let mime = ''
    let finalFilename = ''
    let fileExtension = ''
    let safeBaseName = ''
    let size = 0
    let overwrite = false

    bb.on('field', (name, value) => {
      if (name === 'overwrite') {
        overwrite = value === 'true'
      }
      // BUG The field event is runing after file event, so overwrite condition doesn't work!
    })

    bb.on('file', async (name, file, info) => {
      const { filename, mimeType } = info
      mime = mimeType
      originalName = filename

      fileExtension = path.extname(filename).toLocaleLowerCase()
      safeBaseName = dosSafeBaseName(path.basename(filename, fileExtension))

      await ensureDir(UPLOAD_DIR)

      finalFilename = `${safeBaseName}${fileExtension}`
      finalFilePath = path.join(UPLOAD_DIR, finalFilename)

      if (!overwrite && (await exists(finalFilePath))) {
        finalFilename = generateUniqueFilename(safeBaseName, fileExtension)
        finalFilePath = path.join(UPLOAD_DIR, finalFilename)
      }

      try {
        const fileSize = await atomicStreamWrite(file, finalFilePath)
        size = fileSize
      } catch (err) {
        reject(err)
      }
    })

    bb.on('error', err => reject(err))

    bb.on('finish', async () => {
      if (!finalFilePath) {
        resolve(
          NextResponse.json(
            {
              success: false,
              errors: {
                general: mediaErrors['NO_FILE'].server,
                code: mediaErrors['NO_FILE'].code,
              },
            },
            { status: 400 },
          ),
        )
        return
      }

      // Generate thumbnail for video file
      if (getFileTypeFromExtension(fileExtension) === 'video') {
        const thumbName = generateThumbName(finalFilename)
        const thumbPath = path.join(THUMBNAIL_DIR, thumbName)

        await ensureDir(THUMBNAIL_DIR)
        await generateVideoThumbnail({
          videoPath: finalFilePath,
          thumbPath,
        })
      }

      resolve(
        NextResponse.json({
          success: true,
          data: {
            filename: finalFilename,
            originalName,
            fileUrl: `/assets/${path.basename(finalFilePath)}`,
            size,
            type: mime,
            uploadedAt: new Date().toISOString(),
          },
        }),
      )
    })

    req.signal.addEventListener('abort', () => {
      bb.destroy(new Error('Upload aborted by client'))
    })

    // Convert web stream to node stream
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeStream = Readable.fromWeb(req.body as any)
    nodeStream.pipe(bb)
  })
}

// Atomic write using temp file + rename
async function atomicStreamWrite(
  readable: NodeJS.ReadableStream,
  finalPath: string,
): Promise<number> {
  const dir = path.dirname(finalPath)
  const tmpPath = path.join(dir, `.tmp-${generateId()}`)
  const writeStream = fs.createWriteStream(tmpPath, { flags: 'wx' })

  let completed = false

  try {
    await pipeline(readable, writeStream)
    await fsp.rename(tmpPath, finalPath)

    const stat = await fsp.stat(finalPath)

    completed = true

    return stat.size
  } catch (error) {
    //  cleanup .tmp file on abort/error
    try {
      await fsp.unlink(tmpPath)
    } catch (_) {}

    throw error
  } finally {
    if (!completed) {
      try {
        await fsp.unlink(tmpPath)
      } catch (_) {}
    }
  }
}
