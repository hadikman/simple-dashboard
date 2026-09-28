import { queryOptions } from '@tanstack/react-query'

import { queryUser } from '../../../'

import { userKeys } from '../keys/user.keys'

export function getUserQueryOptions(userId: string) {
  return queryOptions({
    queryKey: userKeys.current(),
    queryFn: async () => {
      const response = await queryUser(userId)

      if (!response.success) {
        throw new Error(response.errors.code ?? 'USER_NOT_FOUND')
      }

      return response.user
    },
  })
}
