import { ObjectId } from 'mongodb'

import {
  type IUserDocument,
  type TGetUserData,
  type TGetUserResponse,
  type TUserResponse,
  userErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'

export async function getUser(data: TGetUserData): Promise<TGetUserResponse> {
  const collection = await mongoManager.getCollection<IUserDocument>(
    COLLECTIONS.USERS,
  )

  const userData = await collection.findOne(
    { _id: new ObjectId(data.id) },
    { projection: { password: 0, schema_version: 0 } },
  )

  if (!userData) {
    return {
      success: false,
      errors: {
        general: userErrors['USER_NOT_FOUND'].server,
        code: 'USER_NOT_FOUND',
      },
    }
  }

  const user: TUserResponse = {
    id: userData._id.toHexString(),
    username: userData.username,
    email: userData.email,
    profile: userData.profile,
    role: userData.role,
    status: userData.status,
    preferences: userData.preferences,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    last_login: userData.last_login,
  }

  return {
    success: true,
    user,
  }
}
