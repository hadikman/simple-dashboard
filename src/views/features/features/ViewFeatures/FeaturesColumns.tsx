import { IconDotsVertical } from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { toast } from 'sonner'

import {
  type TFeatureLookupResponse,
  type TFeatureStatus,
  featureErrors,
} from '../../shared'

import {
  Cell,
  CellBadge,
  NO_SPECIFIED,
  SPECIFIED_LABEL_FOR_APP_CAT,
} from '@/components/data-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteConfirmation } from '@/helpers/confirmation-utils'
import { withMinDelay } from '@/helpers/utils'
import { deleteFeatureAction } from './delete-feature.action'

export const columns: ColumnDef<TFeatureLookupResponse>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    minSize: 240,
    header: 'Name',
    cell: ({ column, row }) => {
      const { name, slug } = row.original

      return (
        <div
          className="flex items-center"
          style={{ width: `${column.getSize()}px` }}
        >
          <Link
            href={`/dashboard/products/features/${slug}`}
            className="text-wrap hover:underline hover:underline-offset-4"
          >
            {name}
          </Link>
        </div>
      )
    },
    enableHiding: false,
    meta: { filterVariant: 'text', header: 'Name' },
  },
  {
    accessorFn: row => row.values.length,
    id: 'values_count',
    header: 'Items',
    cell: ({ row }) => <Cell value={row.original.values.length.toString()} />,
    meta: { minSize: 70, size: 70, header: 'Count' },
  },
  {
    accessorFn: row => row.values.map(({ value }) => value),
    id: 'values',
    minSize: 400,
    header: 'Values',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.values.map(({ id, value }) => (
          <CellBadge key={id}>{value}</CellBadge>
        ))}
      </div>
    ),
    getUniqueValues: ({ values }) => values.map(({ value }) => value),
    filterFn: (row, columnId, filterValue) => {
      const rowValues = row.getValue(columnId) as string[]

      return rowValues.includes(filterValue) ?? false
    },
    enableSorting: false,
    meta: { filterVariant: 'text', header: 'Values' },
  },
  {
    accessorKey: 'applicable_category_name',
    id: 'applicable_category_name',
    minSize: 200,
    header: 'Applicable Category',
    cell: ({ row }) => (
      <CellBadge
        {...(!row.original.applicable_category_name && {
          variant: 'secondary',
        })}
      >
        {row.original.applicable_category_name || SPECIFIED_LABEL_FOR_APP_CAT}
      </CellBadge>
    ),
    getUniqueValues: ({ applicable_category_name }) => [
      applicable_category_name || NO_SPECIFIED, // Add NO_SPECIFIED for not specified applicable category
    ],
    filterFn: (row, columnId, filterValue) => {
      const rowValue = row.getValue(columnId) as string

      if (filterValue === SPECIFIED_LABEL_FOR_APP_CAT) {
        if (rowValue.length === 0) return true
      }

      return rowValue === filterValue
    },
    meta: { filterVariant: 'text', header: 'Applicable Category' },
  },
  {
    accessorKey: 'display_order',
    id: 'display_order',
    header: 'Display Order',
    cell: ({ row }) => <Cell value={row.original.display_order.toString()} />,
    meta: { minSize: 120, size: 120, header: 'Display Order' },
  },
  {
    accessorFn: row => row.status,
    id: 'status',
    header: 'Status',
    cell: ({ row }) => <Cell value={row.original.status} />,
    getUniqueValues: ({ status }) => [status],
    filterFn: (row, columnId, filterValue) => {
      const rowValue = row.getValue(columnId) as TFeatureStatus
      return rowValue === filterValue
    },
    meta: { minSize: 90, size: 90, filterVariant: 'select' },
  },
  {
    accessorKey: 'description',
    id: 'description',
    header: 'Description',
    cell: ({ row }) => <Cell value={row.original.description} />,
    getUniqueValues: row => (row.description ? [row.description] : []),
    meta: { filterVariant: 'text', header: 'Description' },
  },
  {
    accessorKey: 'type',
    id: 'type',
    header: 'Type',
    cell: ({ row }) => <Cell value={row.original.type} />,
    getUniqueValues: row => (row.type ? [row.type] : []),
    meta: { filterVariant: 'text', header: 'Type' },
  },
  {
    accessorKey: 'category',
    id: 'category',
    header: 'Category',
    cell: ({ row }) => <Cell value={row.original.category} />,
    getUniqueValues: row => (row.category ? [row.category] : []),
    meta: { filterVariant: 'text', header: 'Category' },
  },
  {
    accessorKey: 'is_required',
    id: 'is_required',
    header: 'Require',
    cell: ({ row }) => <Cell value={row.original.is_required ? 'Yes' : 'No'} />,
    getUniqueValues: row => [row.is_required ? 'Yes' : 'No'],
    filterFn: (row, columnId, filterValue) => {
      const rowValue = row.getValue(columnId) as boolean
      const aliasValue = rowValue ? 'Yes' : 'No'

      return aliasValue === filterValue
    },
    meta: { minSize: 100, size: 100, filterVariant: 'select' },
  },

  {
    accessorKey: 'created_at',
    id: 'created_at',
    header: 'Create',
    cell: ({ row }) => {
      const { created_at } = row.original
      if (!created_at) return

      const createdAt = created_at
      const date = createdAt.toLocaleDateString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      })
      const time = createdAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

      return (
        <span className="text-muted-foreground inline-grid gap-0.5 text-center text-xs">
          <span>{date}</span>
          <span>{time}</span>
        </span>
      )
    },
    enableColumnFilter: false,
    meta: { size: 48 },
  },
  {
    id: 'actions',
    cell: ({ table, row }) => {
      async function handleDelete() {
        const { id, name } = row.original

        const confirmed = await deleteConfirmation(name)
        if (!confirmed) return

        const result = await toast
          .promise(withMinDelay(deleteFeatureAction({ id, name }), 500), {
            loading: 'Deleting feature...',
            error: 'Failed to delete feature. Please try again.',
          })
          .unwrap()

        if (result.success) {
          toast.success(`The ${name} has been deleted`, {
            duration: 1200,
          })
          table.setRowSelection({})
        } else {
          toast.error(`Failure to delete the ${name}`, {
            description: result.errors.code
              ? featureErrors[result.errors.code].client
              : 'Please try again!',
            duration: 3000,
          })
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableColumnFilter: false,
    meta: { size: 32 },
  },
]
