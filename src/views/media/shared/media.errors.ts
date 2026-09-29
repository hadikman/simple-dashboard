import { type TFileErrorCode, getValidationRules } from './'

const validationRules = getValidationRules()

type ErrorConfig = {
  server: string
  client: string
  code: TFileErrorCode
}

export const mediaErrors = {
  EMPTY_LIBRARY: {
    server: 'Media library is empty - no files found',
    client:
      'Your media library is empty. Upload your first file to get started.',
    code: 'EMPTY_LIBRARY',
  },
  EMPTY_FILE: {
    server: 'Received empty file content (0 bytes)',
    client: 'The file appears to be empty. Please select a file with content.',
    code: 'EMPTY_FILE',
  },
  NO_FILE: {
    server: 'No file field found in multipart form data',
    client: 'No file was uploaded. Please select a file and try again.',
    code: 'NO_FILE',
  },
  DELETE_FAILURE: {
    server: 'Failed to delete file',
    client: 'Could not delete the file. Please try again.',
    code: 'DELETE_FAILURE',
  },
  DISK_FULL_SPACE: {
    server: 'There is not enough disk space to save file',
    client: 'Unable to save file due to insufficient disk space.',
    code: 'DISK_FULL_SPACE',
  },
  UPLOAD_FAILURE: {
    server: 'Failed to upload file',
    client: 'Could not upload the file. Please try again.',
    code: 'UPLOAD_FAILURE',
  },
  INVALID_FORMAT: {
    server: 'Invalid file format uploaded',
    client: 'This file type is not supported. Please upload a valid file.',
    code: 'INVALID_FORMAT',
  },
  SIZE_EXCEEDED: {
    server: 'Uploaded file exceeds size limit',
    client: `File is too large. Please use an file under ${validationRules.maxSize}.`,
    code: 'SIZE_EXCEEDED',
  },
} satisfies Record<TFileErrorCode, ErrorConfig>
