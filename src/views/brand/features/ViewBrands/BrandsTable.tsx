'use client'

import { type TBrandLookupResponse } from '../../shared'

import { DataTable } from '@/components/data-table'
import { columns } from './BrandsColumns'

const defaultColumnVisibility = {
  description: false,
  website: false,
  email: false,
  stats_average_rating: false,
}

type BrandsTableProps = {
  brandsData: TBrandLookupResponse[]
}

export function BrandsTable({ brandsData }: BrandsTableProps) {
  return (
    <DataTable
      data={brandsData}
      columns={columns}
      defaultColumnVisibility={defaultColumnVisibility}
      persistKeys={{
        visibility: 'brands-visibility',
        filter: 'brands-filter',
        pagination: 'brands-pagination',
        selection: 'brands-selection',
      }}
      defaultColumnMinSize={110}
    />
  )
}
