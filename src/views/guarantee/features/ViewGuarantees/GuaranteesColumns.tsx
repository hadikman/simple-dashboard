'use client'

import { IconDotsVertical } from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { toast } from 'sonner'

import {
  type TGuaranteeLookupResponse,
  type TGuaranteeStatus,
  guaranteeErrors,
} from '../../shared'

import { Cell } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteConfirmation } from '@/helpers/confirmation-utils'
import {
  capitalizeWords,
  formatLocalDateTime,
  withMinDelay,
} from '@/helpers/utils'
import { deleteGuaranteeAction } from './delete-guarantee.action'

export const columns: ColumnDef<TGuaranteeLookupResponse>[] = [
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
            href={`/dashboard/products/guarantees/${slug}`}
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
    accessorFn: row => row.brand_name ?? '',
    id: 'brand_name',
    header: 'Brand',
    cell: ({ row }) => <Cell value={row.original.brand_name || ''} />,
    meta: { minSize: 120, size: 120, filterVariant: 'text' },
  },
  {
    accessorFn: row => row.duration,
    id: 'duration',
    header: 'Duration',
    cell: ({ row }) => <Cell value={row.original.duration} />,
    meta: { minSize: 96, size: 96, filterVariant: 'text' },
  },
  {
    accessorFn: row => row.extra_price,
    id: 'extra_price',
    header: 'Extra Price',
    cell: ({ row }) => <Cell value={row.original.extra_price.toString()} />,
    meta: { minSize: 96, size: 96, filterVariant: 'range' },
  },
  {
    accessorFn: row => row.target_items.length,
    id: 'stats_product_count',
    header: 'Items',
    cell: ({ row }) => (
      <Cell value={row.original.target_items.length.toString()} />
    ),
    meta: { minSize: 70, size: 70, filterVariant: 'range' },
  },
  {
    accessorFn: row => row.extra_duration.length,
    id: 'stats_extra_duration_count',
    header: 'Options',
    cell: ({ row }) => (
      <Cell value={row.original.extra_duration.length.toString()} />
    ),
    meta: { minSize: 70, size: 70, filterVariant: 'range' },
  },
  {
    accessorFn: row => row.status,
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { status } = row.original
      const variant: Record<
        TGuaranteeStatus,
        'default' | 'secondary' | 'destructive' | 'outline'
      > = {
        active: 'default',
        inactive: 'secondary',
      }

      return (
        <Badge
          data-is-inactive={status === 'inactive'}
          className="data-[is-inactive=true]:text-muted-foreground px-1.5"
          variant={variant[status]}
        >
          {capitalizeWords(status)}
        </Badge>
      )
    },
    getUniqueValues: ({ status }) => [capitalizeWords(status)],
    filterFn: (row, columnId, filterValue) => {
      const rowValue = row.getValue(columnId) as TGuaranteeStatus
      return capitalizeWords(rowValue) === capitalizeWords(filterValue)
    },
    meta: { minSize: 56, filterVariant: 'select' },
  },
  {
    accessorKey: 'description',
    id: 'description',
    header: 'Description',
    cell: ({ row }) => <Cell value={row.original.description} />,
    meta: { minSize: 280, size: 280 },
  },
  {
    accessorKey: 'created_at',
    id: 'created_at',
    header: 'Create',
    cell: ({ row }) => {
      const { created_at } = row.original
      if (!created_at) return

      const date = formatLocalDateTime({ date: created_at, type: 'date' })
      const time = formatLocalDateTime({ date: created_at, type: 'time' })

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
          .promise(withMinDelay(deleteGuaranteeAction({ id, name }), 500), {
            loading: 'Deleting guarantee...',
            error: 'Failed to delete guarantee. Please try again.',
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
              ? guaranteeErrors[result.errors.code].client
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
