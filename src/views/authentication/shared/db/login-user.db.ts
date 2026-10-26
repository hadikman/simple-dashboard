import {
  type IUserDocument,
  type TLoginUserData,
  type TLoginUserResponse,
  type TUserResponse,
  userErrors,
} from '../../shared'

import { COLLECTIONS, mongoManager } from '@/config/db'
import { comparePassword } from '@/helpers/utils'

export async function loginUser(
  userData: TLoginUserData,
): Promise<TLoginUserResponse> {
  const collection = await mongoManager.getCollection<IUserDocument>(
    COLLECTIONS.USERS,
  )

  const { email, password } = userData

  const data = await collection.findOne({ email })

  if (!data) {
    return {
      success: false,
      errors: {
        general: userErrors['INVALID_CREDENTIALS'].server,
        code: 'INVALID_CREDENTIALS',
      },
    }
  }

  const isPasswordValid = await comparePassword(password, data.password)

  if (!isPasswordValid) {
    return {
      success: false,
      errors: {
        general: userErrors['INVALID_CREDENTIALS'].server,
        code: 'INVALID_CREDENTIALS',
      },
    }
  }

  if (data.status === 'inactive') {
    return {
      success: false,
      errors: {
        general: userErrors['INACTIVE_USER'].server,
        code: 'INACTIVE_USER',
      },
    }
  }

  const updatedData = await collection.findOneAndUpdate(
    { _id: data._id },
    { $set: { last_login: new Date() } },
    {
      returnDocument: 'after',
      projection: {
        password: 0,
        schema_version: 0,
        preferences: 0,
      },
    },
  )

  if (!updatedData) {
    return {
      success: false,
      errors: {
        general: userErrors['UPDATE_FAILURE'].server,
        code: 'UPDATE_FAILURE',
      },
    }
  }

  const user: TUserResponse = {
    id: updatedData._id.toHexString(),
    username: updatedData.username,
    email: updatedData.email,
    profile: updatedData.profile,
    role: updatedData.role,
    status: updatedData.status,
    preferences: updatedData.preferences,
    created_at: updatedData.created_at,
    updated_at: updatedData.updated_at,
    last_login: updatedData.last_login,
  }

  return {
    success: true,
    user,
  }
}
