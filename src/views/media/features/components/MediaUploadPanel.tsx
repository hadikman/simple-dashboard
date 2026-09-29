'use client'

import { CheckCircle, FileText, Trash2, Upload, X } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

import {
  type IUploadBatch,
  type IUploadItem,
  type IUploadStatus,
  type TUploadFilesResponse,
  getValidationRules,
  mediaErrors,
  SMALL_FILE_LIMIT,
  triggerRevalidationAfterUploadsAction,
  validateFiles,
} from '../../shared'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { generateId } from '@/helpers/utils'

export function MediaUploadPanel() {
  const [selectedFiles, setSelectedFiles] = React.useState<IUploadItem[]>([])
  const filePickerRef = React.useRef<HTMLInputElement>(null)
  const batchRef = React.useRef<IUploadBatch | null>(null)

  function handleOpenFilePicker() {
    filePickerRef.current?.click()
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const validFiles = validateSelectedFiles(files)
    if (!validFiles) return

    prepareToUploadFiles(validFiles)
  }

  function validateSelectedFiles(files: FileList): File[] | void {
    // Convert FileList to array and create upload items
    const fileArray = Array.from(files)
    const { validFiles, invalidFiles } = validateFiles(fileArray)

    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ file, error }) => {
        toast.error('Invalid file', {
          description: `${file.name}: ${(error.code && mediaErrors[error.code].client) || 'Invalid file format'}`,
          duration: 3000,
        })
      })

      // If no valid files, stop here
      if (validFiles.length === 0) {
        if (filePickerRef.current) {
          filePickerRef.current.value = ''
        }
        return
      }

      // Show summary toast for partial validation
      if (validFiles.length > 0) {
        toast.info('Some files were skipped', {
          description: `${validFiles.length} file(s) queued for upload, ${invalidFiles.length} file(s) skipped due to validation errors.`,
          duration: 4000,
        })
      }
    }

    return validFiles
  }

  function prepareToUploadFiles(validFiles: File[]) {
    const newUploadItems: IUploadItem[] = validFiles.map((file, index) => ({
      id: `${index}-${generateId()}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'pending' as IUploadStatus,
      file: file,
      type: file.type,
    }))

    // Add to selected files list
    setSelectedFiles(prev => [...prev, ...newUploadItems])

    // Show upload started toast for multiple files
    if (newUploadItems.length > 1) {
      toast.success(`Starting upload of ${newUploadItems.length} files`, {
        duration: 3000,
      })
    }

    startBatch(newUploadItems.length)

    // Start uploading each file
    newUploadItems.forEach(item => {
      uploadFileWithToast(item)
    })

    // Reset file input
    if (filePickerRef.current) {
      filePickerRef.current.value = ''
    }
  }

  // Upload function with toast notifications
  async function uploadFileWithToast(uploadItem: IUploadItem) {
    setSelectedFiles(prev =>
      prev.map(item =>
        item.id === uploadItem.id
          ? { ...item, status: 'uploading' as IUploadStatus }
          : item,
      ),
    )

    try {
      await toast
        .promise(uploadFile(uploadItem), {
          error: error => {
            return {
              message: 'Failed to upload file',
              description: error.message,
            }
          },
        })
        .unwrap()

      onUploadSuccess()
    } catch (error) {
      onUploadFailure()
      // Error already handled in toast.promise
    }
  }

  function startBatch(total: number) {
    batchRef.current = {
      total,
      completed: 0,
      failed: 0,
      cancelled: 0,
      revalidated: false,
    }
  }

  function uploadFile(uploadItem: IUploadItem): Promise<TUploadFilesResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()

      formData.append('file', uploadItem.file)
      formData.append('filename', uploadItem.name)
      // STANDBY
      // formData.append('overwrite', 'true')

      // Upload progress
      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setSelectedFiles(prev =>
            prev.map(item =>
              item.id === uploadItem.id ? { ...item, progress } : item,
            ),
          )
        }
      })

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setSelectedFiles(prev =>
            prev.map(item =>
              item.id === uploadItem.id
                ? {
                    ...item,
                    status: 'completed' as IUploadStatus,
                    progress: 100,
                  }
                : item,
            ),
          )

          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            resolve({
              success: true,
              data: error.message || 'Generate data has issue.',
            })
          }
        } else {
          setSelectedFiles(prev =>
            prev.map(item =>
              item.id === uploadItem.id
                ? {
                    ...item,
                    status: 'error' as IUploadStatus,
                    error: `Upload failed: ${xhr.status} ${xhr.statusText}`,
                  }
                : item,
            ),
          )
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        setSelectedFiles(prev =>
          prev.map(item =>
            item.id === uploadItem.id
              ? {
                  ...item,
                  status: 'error' as IUploadStatus,
                  error: 'Network error occurred',
                }
              : item,
          ),
        )

        reject(new Error('Network error occurred'))
      })

      // Handle abort
      xhr.addEventListener('abort', () => {
        setSelectedFiles(prev =>
          prev.map(item =>
            item.id === uploadItem.id
              ? { ...item, status: 'cancelled' as IUploadStatus }
              : item,
          ),
        )

        onUploadCancelled()

        reject(new Error(`${uploadItem.name} upload was cancelled`))
      })

      // Send request
      if (uploadItem.size <= SMALL_FILE_LIMIT) {
        xhr.open('POST', '/api/upload')
      } else {
        xhr.open('POST', '/api/stream-upload')
      }
      xhr.send(formData)

      // Store XHR reference in upload item
      setSelectedFiles(prev =>
        prev.map(item => (item.id === uploadItem.id ? { ...item, xhr } : item)),
      )
    })
  }

  function onUploadSuccess() {
    if (!batchRef.current) return
    batchRef.current.completed++
    checkBatchDone()
  }

  function onUploadFailure() {
    if (!batchRef.current) return
    batchRef.current.failed++
    checkBatchDone()
  }

  function onUploadCancelled() {
    if (!batchRef.current) return
    batchRef.current.cancelled++
    checkBatchDone()
  }

  async function checkBatchDone() {
    const batch = batchRef.current
    if (!batch) return

    const done =
      batch.completed + batch.failed + batch.cancelled === batch.total

    if (!done) return

    // Prevent double execution
    if (batch.revalidated) return
    batch.revalidated = true

    await triggerRevalidationAfterUploadsAction()

    if (batch.completed === 1) {
      toast.success('Success Upload', {
        description: 'File uploaded successfully',
        duration: 1200,
      })
    } else if (batch.completed > 1) {
      toast.success('Success Upload', {
        description: `${batch.completed} files uploaded successfully`,
        duration: 1200,
      })
    }

    batchRef.current = null
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDropFiles(e: React.DragEvent) {
    e.preventDefault()

    const droppedFiles = e.dataTransfer.files
    if (!droppedFiles || droppedFiles.length === 0) return

    const validFiles = validateSelectedFiles(droppedFiles)
    if (!validFiles) return

    prepareToUploadFiles(validFiles)
  }

  function handleCancelUpload(id: string) {
    const item = selectedFiles.find(i => i.id === id)

    if (item && item.xhr && item.status === 'uploading') {
      item.xhr.abort()
      setSelectedFiles(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status: 'cancelled' as IUploadStatus }
            : item,
        ),
      )
    }

    handleRemoveUploadById(id)
  }

  function handleRemoveUploadById(id: string) {
    setSelectedFiles(prev => prev?.filter(file => file.id !== id))
  }

  function clearCompletedUploads() {
    setSelectedFiles(prev => prev.filter(file => file.status !== 'completed'))
  }

  // Get validation rules for display
  const validationRules = getValidationRules()

  const uploadingFiles = selectedFiles?.filter(
    file => file.status !== 'completed',
  )
  const completedUploads = selectedFiles?.filter(
    file => file.status === 'completed',
  )

  return (
    <div className="flex flex-col gap-y-6 lg:max-w-sm">
      <Card
        className="group hover:bg-muted/50 flex max-h-50 w-full cursor-pointer flex-col items-center justify-center gap-4 border-dashed py-8 text-sm transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDropFiles}
        onClick={handleOpenFilePicker}
      >
        <div className="grid space-y-3">
          <div className="text-muted-foreground flex items-center gap-x-2 px-1.5">
            <Upload className="size-5" />
            <div>
              Drop files here or{' '}
              <Button
                variant="link"
                className="text-primary h-auto p-0 font-normal"
                onClick={e => {
                  e.stopPropagation()
                  handleOpenFilePicker()
                }}
              >
                browse files
              </Button>{' '}
              to add
            </div>
          </div>
        </div>
        <input
          ref={filePickerRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFileInputChange}
        />
        <span className="text-muted-foreground mt-2 block px-1.5 text-center text-xs group-disabled:opacity-50">
          Supported: {validationRules.allowedTypes.join(', ')} (max{' '}
          {validationRules.maxSize})
        </span>
      </Card>

      <div className="flex flex-col gap-y-4">
        {uploadingFiles && uploadingFiles.length > 0 && (
          <div>
            <h2 className="text-foreground mb-4 flex items-center text-xs font-normal uppercase">
              Waiting ({uploadingFiles.length})
            </h2>
            <div className="-mt-2 divide-y">
              {uploadingFiles.map(file => (
                <MediaUploadInfo
                  key={file.id}
                  file={file}
                  onClearClick={handleCancelUpload}
                />
              ))}
            </div>
          </div>
        )}

        {uploadingFiles.length > 0 && completedUploads.length > 0 && (
          <Separator className="my-0" />
        )}

        {/* Completed section */}
        {completedUploads && completedUploads.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground flex items-center text-xs font-normal uppercase">
                <CheckCircle className="mr-1 size-4" />
                Finished ({completedUploads.length})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={clearCompletedUploads}
              >
                <Trash2 className="mr-1 size-3" />
                Clear All
              </Button>
            </div>
            <div className="-mt-2 divide-y">
              {completedUploads.map(file => (
                <MediaUploadInfo
                  key={file.id}
                  file={file}
                  onClearClick={handleRemoveUploadById}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

type MediaUploadInfoProps = {
  file: IUploadItem
  onClearClick: (id: string) => void
}
function MediaUploadInfo({ file, onClearClick }: MediaUploadInfoProps) {
  const showStatus = file.status === 'pending' || file.status === 'error'

  return (
    <div key={file.id} className="group flex items-start py-4">
      <div
        className="bg-muted mr-3 grid size-10 shrink-0 place-content-center rounded border"
        onClick={() => onClearClick(file.id)}
      >
        <FileText className="inline size-4 group-hover:hidden" />
        <Button
          variant="ghost"
          size="icon"
          className="hidden size-4 h-auto p-0 group-hover:inline"
          aria-label="Remove"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="mb-1 flex w-full flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="text-foreground text-sm/6 text-pretty wrap-break-word [word-break:break-word] group-disabled:opacity-50">
            {file.name}
          </div>
          {showStatus ? (
            <Badge
              className="ml-auto"
              variant={
                file.status === 'pending'
                  ? 'secondary'
                  : file.status === 'error'
                    ? 'destructive'
                    : undefined
              }
            >
              {file.status}
            </Badge>
          ) : null}
          {file.status !== 'error' && (
            <div className="text-muted-foreground text-sm tabular-nums">
              {file.progress}%
            </div>
          )}
        </div>
        <Progress value={file.progress} className="mt-1 h-2 min-w-64" />
      </div>
    </div>
  )
}
