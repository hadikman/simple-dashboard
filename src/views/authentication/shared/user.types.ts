import { ObjectId } from 'mongodb'

import type { Prettify, WithId } from '@/helpers/ts-utils'

export type TUserStatus = 'active' | 'inactive'

export type TUserRole =
  'author' | 'editor' | 'store_manager' | 'general_manager' | 'admin'

export interface IUserProfile {
  name: string
  family: string
  avatar: string
}

export interface IUserPreferences {
  email_notifications: boolean
}

export interface IUserDocument {
  schema_version: number
  username: string
  email: string
  password: string
  profile: IUserProfile
  role: TUserRole
  status: TUserStatus
  preferences: IUserPreferences
  created_at: Date
  updated_at: Date
  last_login: Date | null
}

export interface IUserLookupDocument {
  _id: ObjectId
  schema_version: number
  username: string
  email: string
  password: string
  profile: IUserProfile
  role: TUserRole
  status: TUserStatus
  preferences: IUserPreferences
  created_at: Date
  updated_at: Date
  last_login: Date | null
}

type TRemovedSensitiveUserProps = Omit<
  IUserDocument,
  'schema_version' | 'password'
>

export type TUserResponse = WithId<TRemovedSensitiveUserProps>

export type TUserLookupDataWithId = Prettify<
  Omit<TRemovedSensitiveUserProps, '_id'> & {
    id: string
  }
>

export type TUserData = Prettify<
  Omit<
    TRemovedSensitiveUserProps,
    '_id' | 'created_at' | 'updated_at' | 'last_login'
  >
>

export type TUserLookupResponse = TUserLookupDataWithId

export type TUserErrorCode =
  | 'USER_EXISTS'
  | 'USER_NOT_FOUND'
  | 'INVALID_CREDENTIALS'
  | 'INACTIVE_USER'
  | 'CREATE_FAILURE'
  | 'UPDATE_FAILURE'

export interface IUserValidation {
  general?: string | undefined
  code?: TUserErrorCode | undefined
}

// Register User
export type TRegisterUserData = Pick<
  IUserDocument,
  'email' | 'username' | 'password'
>

export type TRegisterUserResponse =
  | {
      success: true
      user: TUserResponse
    }
  | {
      success: false
      errors: IUserValidation
    }

// Login User
export type TLoginUserData = Pick<IUserDocument, 'email' | 'password'>

export type TLoginUserResponse =
  | {
      success: true
      user: TUserResponse
    }
  | {
      success: false
      errors: IUserValidation
    }

// Get User
export type TGetUserData = { id: string }

export type TGetUserResponse =
  | {
      success: true
      user: TUserLookupResponse
    }
  | {
      success: false
      errors: IUserValidation
    }

// Logout User
export type TLogoutUserResponse =
  | {
      success: true
    }
  | {
      success: false
      errors: IUserValidation
    }

// Get Users Props
export type TGetUsersPropsResponse<T> =
  | {
      success: true
      users: WithId<T>[]
    }
  | {
      success: false
      errors: IUserValidation
    }

// Check Duplicate User
export type TCheckDuplicateUserResponse =
  | {
      isDuplicate: true
      message: IUserValidation
    }
  | {
      isDuplicate: false
      message: null
    }
