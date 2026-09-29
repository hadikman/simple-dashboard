'use client'

import { BananaIcon, MaximizeIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import {
  type IFileInfo,
  EXTENSION_ICON,
  FILE_TYPE_ICON,
  formatFileSize,
  getFileTypeFromExtension,
  HOME_DIRECTORY,
  THUMBNAIL_DIRECTORY,
  useMediaStore,
} from '../../../shared'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DeleteMediaFile } from './DeleteMediaFile'

type PreviewMediaFilesProps = { files: IFileInfo[] }
export function PreviewMediaFiles({ files }: PreviewMediaFilesProps) {
  const router = useRouter()
  const params = useSearchParams()

  let key = ''

  const selectionQuery = params.get('selection')
  const keyQuery = params.get('key')

  if (keyQuery) {
    key = keyQuery
  }

  const thumbnailImages = useMediaStore(key, select => select.thumbnailImages)
  const images = useMediaStore(key, select => select.images)

  const setThumbnailImages = useMediaStore(
    key,
    select => select.setThumbnailImages,
  )
  const toggleImages = useMediaStore(key, select => select.toggleImages)
  const clearAll = useMediaStore(key, select => select.clearAll)

  const isSingle = selectionQuery === 'single'
  const isMulti = selectionQuery === 'multi'
  const isSelectMode = isSingle || isMulti

  const groupedFiles = Object.groupBy(files, ({ isDirectory }) =>
    isDirectory ? 'directories' : 'files',
  )
  const imageFiles = groupedFiles.files?.filter(
    ({ extension }) => getFileTypeFromExtension(extension) === 'image',
  )

  React.useEffect(() => {
    if (!isSelectMode) clearAll()
  }, [clearAll, isSelectMode])

  function handleImageClick(filename: string, selected: boolean) {
    if (!isSelectMode) {
      router.push(`/dashboard/media/file/${filename}`)
      return
    }

    if (isSingle) {
      setThumbnailImages(selected ? '' : filename)
    }

    if (isMulti) {
      toggleImages(filename)
    }
  }

  const finalFiles = isSelectMode ? imageFiles : groupedFiles?.files
  const hasFinalFiles = finalFiles && finalFiles.length > 0

  return (
    <div
      data-select-mode={isSelectMode}
      className="flex flex-wrap content-start gap-4 data-[select-mode=true]:me-4"
    >
      {hasFinalFiles ? (
        finalFiles.map(file => {
          const { filename } = file
          const selected = isSingle
            ? thumbnailImages.includes(filename)
            : images.includes(filename)

          return (
            <PreviewItem
              key={filename}
              file={file}
              selected={selected}
              isSelectMode={isSelectMode}
              onItemClick={handleImageClick}
            />
          )
        })
      ) : (
        // Only displayed when no image exists
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BananaIcon />
            </EmptyMedia>
            <EmptyTitle>Empty Media, Upload A New Image.</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t uploaded any images yet. You can start by
              uploading your first image from the{' '}
              <span className="font-medium">&quot;Upload&quot;</span> panel.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}

type PreviewItemProps = {
  file: IFileInfo
  selected: boolean
  isSelectMode: boolean
  onItemClick: (name: string, selected: boolean) => void
}
function PreviewItem({
  file,
  selected,
  isSelectMode,
  onItemClick,
}: PreviewItemProps) {
  const { extension, filename, thumbnail, publicPath, filePath, size } = file

  const fileType = getFileTypeFromExtension(extension)
  const FileIcon = EXTENSION_ICON[extension] || FILE_TYPE_ICON[fileType]

  const isImage = fileType === 'image'
  const isVideo = fileType === 'video'

  return (
    <Tooltip delayDuration={1200}>
      <TooltipTrigger asChild>
        <div
          data-selected={selected}
          className="group/file data-[selected=true]:ring-ring relative rounded-md data-[selected=true]:ring-3 data-[selected=true]:ring-offset-3"
          onClick={() => {
            if (isImage) onItemClick(filename, selected)
          }}
        >
          <div className="relative grid size-18 place-content-center overflow-clip rounded-md border sm:size-24">
            {isImage ? (
              <Image
                className="object-contain"
                src={publicPath}
                alt=""
                fill
                sizes="60px"
              />
            ) : isVideo ? (
              <Image
                className="object-contain"
                src={`/${HOME_DIRECTORY}/${THUMBNAIL_DIRECTORY}/${thumbnail}`}
                alt=""
                fill
                sizes="60px"
              />
            ) : null}
            <div
              data-has-bg-img={isImage || isVideo}
              className="bg-secondary size-8 rounded-md p-1 data-[has-bg-img=true]:opacity-60"
            >
              <FileIcon className="size-full" />
            </div>
          </div>
          {!isSelectMode && isImage && (
            <MaximizeIcon className="text-muted absolute top-1.5 left-1.5 size-3.5" />
          )}
          <DeleteMediaFile filePath={filePath} thumbnail={thumbnail} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {filename} <span className="font-medium">{formatFileSize(size)}</span>
      </TooltipContent>
    </Tooltip>
  )
}
