'use server'

import { type TLogoutUserResponse, userErrors } from '../'
import { deleteSession } from '../server'

export async function logoutUserAction(): Promise<TLogoutUserResponse> {
  try {
    await deleteSession()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: {
        general: userErrors['UPDATE_FAILURE'].server,
        code: 'UPDATE_FAILURE',
      },
    }
  }
}
