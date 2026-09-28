import { type TUserErrorCode } from '../shared'

type ErrorConfig = {
  server: string
  client: string
  code: TUserErrorCode
}

export const userErrors = {
  USER_EXISTS: {
    server: 'User with this email or username already exists in database',
    client:
      'This email or username is already taken. Please choose a different one.',
    code: 'USER_EXISTS',
  },
  USER_NOT_FOUND: {
    server: 'User not found in database',
    client: 'User not found',
    code: 'USER_NOT_FOUND',
  },
  INVALID_CREDENTIALS: {
    server: 'Invalid email or password attempt',
    client: 'Invalid email or password. Please try again.',
    code: 'INVALID_CREDENTIALS',
  },
  INACTIVE_USER: {
    server: 'Inactive user attempted to login',
    client: 'Your account is inactive. Please contact support.',
    code: 'INACTIVE_USER',
  },
  CREATE_FAILURE: {
    server: 'Failed to create new user in database',
    client: 'Could not create your account. Please try again.',
    code: 'CREATE_FAILURE',
  },
  UPDATE_FAILURE: {
    server: 'Failed to update user in database',
    client: 'Could not update your profile. Please try again.',
    code: 'UPDATE_FAILURE',
  },
} satisfies Record<TUserErrorCode, ErrorConfig>
