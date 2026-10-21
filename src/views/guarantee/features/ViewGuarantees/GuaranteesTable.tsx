'use client'

import { type TGuaranteeLookupResponse } from '../../shared'

import { DataTable } from '@/components/data-table'
import { columns } from './GuaranteesColumns'

const defaultColumnVisibility = {
  description: false,
}

type GuaranteesListProps = { guaranteesData: TGuaranteeLookupResponse[] }

export function GuaranteesTable({ guaranteesData }: GuaranteesListProps) {
  return (
    <DataTable
      data={guaranteesData}
      columns={columns}
      defaultColumnVisibility={defaultColumnVisibility}
      persistKeys={{
        visibility: 'guarantees-visibility',
        filter: 'guarantees-filter',
        pagination: 'guarantees-pagination',
        selection: 'guarantees-selection',
      }}
      defaultColumnMinSize={110}
    />
  )
}
