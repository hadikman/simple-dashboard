'use client'

import { type TOfferLookupResponse } from '../../shared'

import { DataTable } from '@/components/data-table'
import { columns } from './OffersColumns'

const defaultColumnVisibility = {
  description: false,
}

type OffersListProps = { offersData: TOfferLookupResponse[] }

export function OffersTable({ offersData }: OffersListProps) {
  return (
    <DataTable
      data={offersData}
      columns={columns}
      defaultColumnVisibility={defaultColumnVisibility}
      persistKeys={{
        visibility: 'offers-visibility',
        filter: 'offers-filter',
        pagination: 'offers-pagination',
        selection: 'offers-selection',
      }}
      defaultColumnMinSize={110}
    />
  )
}
