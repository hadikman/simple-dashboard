import {
  type IUserDocument,
  type IUserPreferences,
  type IUserProfile,
  type TRegisterUserData,
  type TRegisterUserResponse,
  type TUserResponse,
  userErrors,
} from '../../shared'

import { mongoManager } from '@/config/db/MongoManager'
import { getCurrentUTCDate, hashPassword } from '@/helpers/utils'

export async function registerUser(
  newUser: TRegisterUserData,
): Promise<TRegisterUserResponse> {
  const db = await mongoManager.getConnectedDatabase()
  const collection = db.collection<IUserDocument>(mongoManager.USERS_COLL)

  const existingUser = await collection.findOne({
    $or: [{ email: newUser.email }, { username: newUser.username }],
  })

  if (existingUser) {
    return {
      success: false,
      errors: {
        general: userErrors['USER_EXISTS'].server,
        code: 'USER_EXISTS',
      },
    }
  }

  const profile: IUserProfile = {
    name: '',
    family: '',
    avatar: '',
  }
  const preferences: IUserPreferences = {
    email_notifications: true,
  }

  const currentUTCDate = getCurrentUTCDate()

  const newUserDoc: IUserDocument = {
    schema_version: 1,
    username: newUser.username,
    email: newUser.email,
    password: await hashPassword(newUser.password),
    profile,
    role: 'admin',
    status: 'active',
    preferences,
    created_at: currentUTCDate,
    updated_at: currentUTCDate,
    last_login: null,
  }

  const data = await collection.insertOne(newUserDoc)

  if (!data.acknowledged) {
    return {
      success: false,
      errors: {
        general: userErrors['CREATE_FAILURE'].server,
        code: 'CREATE_FAILURE',
      },
    }
  }

  const user: TUserResponse = {
    id: data.insertedId.toHexString(),
    email: newUser.email,
    username: newUser.username,
    profile,
    role: newUserDoc.role,
    status: newUserDoc.status,
    preferences,
    created_at: newUserDoc.created_at,
    updated_at: newUserDoc.updated_at,
    last_login: newUserDoc.last_login,
  }

  return {
    success: true,
    user,
  }
}
