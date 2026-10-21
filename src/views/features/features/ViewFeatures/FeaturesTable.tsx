'use client'

import { type TFeatureLookupResponse } from '../../shared'

import { DataTable } from '@/components/data-table'
import { columns } from './FeaturesColumns'

const defaultColumnVisibility = {
  display_order: false,
  status: false,
  category: false,
  is_required: false,
  type: false,
  description: false,
}

type FeaturesListProps = { featuresData: TFeatureLookupResponse[] }

export function FeaturesTable({ featuresData }: FeaturesListProps) {
  return (
    <DataTable
      data={featuresData}
      columns={columns}
      defaultColumnVisibility={defaultColumnVisibility}
      persistKeys={{
        visibility: 'features-visibility',
        filter: 'features-filter',
        pagination: 'features-pagination',
        selection: 'features-selection',
      }}
      defaultColumnMinSize={110}
    />
  )
}
