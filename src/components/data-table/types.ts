import type {
  ColumnDef,
  RowSelectionState,
  Table,
  TableMeta,
  VisibilityState,
} from '@tanstack/react-table'

export type PersistKeys = {
  /** URL key for selection (default: 'selection') */
  selection?: string
  /** localStorage key for column visibility (REQUIRED, must be unique per table) */
  visibility: string
  /** URL key for filters (default: 'filter') */
  filter?: string
  /** URL key for pagination (default: 'pagination') */
  pagination?: string
}

export type DataTableProps<TData> = {
  data: TData[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  defaultColumnVisibility?: VisibilityState
  persistKeys: PersistKeys
  /** Enable expandable sub-rows */
  enableExpanding?: boolean
  /** Enable row selection checkboxes & selection info. Default: true */
  enableRowSelection?: boolean
  getSubRows?: (row: TData) => TData[] | undefined
  /** Default minSize for columns */
  defaultColumnMinSize?: number
  /** Custom toolbar actions on the left side (e.g. Delete button) */
  toolbarActions?: (ctx: {
    table: Table<TData>
    rowSelection: RowSelectionState
  }) => React.ReactNode
  /** Passed to useReactTable `meta` option — accessible via `table.options.meta` in cells */
  tableMeta?: TableMeta<TData>
  /** Called after bulk operations finish to reset state */
  onResetSelection?: () => void
}
