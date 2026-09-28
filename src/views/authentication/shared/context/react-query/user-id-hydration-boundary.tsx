import {
  type UseQueryOptions,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'
import React from 'react'

import { querySession } from '../../'

import { getQueryClient } from './get-query-client'

export function UserIdHydrationBoundary<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends readonly unknown[],
>({
  children,
  queryOptions,
}: {
  children: (userId: string) => React.ReactNode
  queryOptions: (
    userId: string,
  ) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
}) {
  const { userId } = React.use(querySession())
  const queryClient = getQueryClient()

  queryClient.query(queryOptions(userId))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children(userId)}
    </HydrationBoundary>
  )
}
