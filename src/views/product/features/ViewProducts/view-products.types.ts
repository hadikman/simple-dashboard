import { type TProductLookupResponse } from '../../shared'

export type TProductLookupResponseWithSubRows = {
  subRows?: TProductLookupResponseWithSubRows[]
} & TProductLookupResponse

export type TProductLookupResponseWithSubRowsData =
  TProductLookupResponseWithSubRows[]
