import { type TPostLookupResponse } from '../../shared'

export type TPostLookupResponseWithSubRows = {
  subRows?: TPostLookupResponseWithSubRows[]
} & TPostLookupResponse

export type TPostLookupResponseWithSubRowsData =
  TPostLookupResponseWithSubRows[]
