import { writeFile } from 'fs/promises'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

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
  request: NextRequest,
): Promise<NextResponse<TUploadFilesResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const filename = (formData.get('filename') as string) || file.name
    const overwrite = formData.get('overwrite') === 'true'

    const fileExtension = path.extname(filename).toLocaleLowerCase()
    const safeBaseName = dosSafeBaseName(path.basename(filename, fileExtension))

    await ensureDir(UPLOAD_DIR)

    let finalFilename = `${safeBaseName}${fileExtension}`
    let finalFilePath = path.join(UPLOAD_DIR, finalFilename)

    // Generate unique name if file exists
    if (await exists(finalFilePath)) {
      if (!overwrite) {
        finalFilename = generateUniqueFilename(safeBaseName, fileExtension)
        finalFilePath = path.join(UPLOAD_DIR, finalFilename)
      }
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(finalFilePath, buffer)

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

    // Revalidates the files cache to reflect newly uploaded files,
    // even if the user refreshes during upload
    revalidateTag('files', 'max')

    return NextResponse.json({
      success: true,
      data: {
        filename: finalFilename,
        originalName: file.name,
        fileUrl: `/assets/${finalFilename}`,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log('Upload error:', error)

    if (error.code === 'ENOSPC') {
      return NextResponse.json(
        {
          success: false,
          errors: {
            general: mediaErrors['DISK_FULL_SPACE'].server,
            code: 'DISK_FULL_SPACE',
          },
        },
        { status: 507 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        errors: {
          general: mediaErrors['UPLOAD_FAILURE'].server,
          code: 'UPLOAD_FAILURE',
        },
      },
      { status: 500 },
    )
  }
}
