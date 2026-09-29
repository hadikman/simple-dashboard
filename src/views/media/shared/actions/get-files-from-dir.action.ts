'use server'

import { cacheTag } from 'next/cache'
import path from 'path'

import { type TGetFilesFromDir, HOME_DIRECTORY, ROOT } from '../'

import { getFilesFromDir } from '../disk-io/get-files-from-dir'

export async function getFilesFromDirAction(
  props?: Omit<TGetFilesFromDir, 'directoryPath'>,
) {
  'use cache'

  const fullPath = path.join(process.cwd(), ROOT, HOME_DIRECTORY)

  const result = await getFilesFromDir({
    directoryPath: fullPath,
    ...props,
  })

  if (result.success) {
    cacheTag('files')
  }

  return result
}
