import { RowData } from '@tanstack/react-table'

import type { FeatureValuesTableMeta } from './feature-values-table.types'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    featureValues?: FeatureValuesTableMeta
  }
}
