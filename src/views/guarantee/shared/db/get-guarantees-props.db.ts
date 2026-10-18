import { ObjectId } from 'mongodb'

import type { ProjectionKeys, WithId } from '@/helpers/ts-utils'

import {
  type IGuaranteeDocument,
  type TGetGuaranteesPropsResponse,
  guaranteeErrors,
} from '../'

import { mongoManager } from '@/config/db/MongoManager'

export async function getGuaranteesProps<
  T extends Partial<Record<keyof IGuaranteeDocument, unknown>>,
>(keys: ProjectionKeys<T>): Promise<TGetGuaranteesPropsResponse<T>> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IGuaranteeDocument>(
    mongoManager.GUARANTEES_COLL,
  )

  const cursor = collection.find()
  const projectCursor = cursor.project<T & { _id: ObjectId }>(keys)
  const data = await projectCursor.toArray()

  if (data.length === 0) {
    return {
      success: false,
      errors: {
        general: guaranteeErrors['NOT_FOUND_GUARANTEES_PROPS'].server,
        code: 'NOT_FOUND_GUARANTEES_PROPS',
      },
    }
  }

  const formattedData = data.map(({ _id, ...rest }) => ({
    ...rest,
    id: _id.toHexString(),
  })) as unknown as WithId<T>[]

  return {
    success: true,
    guarantees: formattedData,
  }
}
