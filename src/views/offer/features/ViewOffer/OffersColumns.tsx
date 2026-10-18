import { IconDotsVertical } from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import React from 'react'
import { toast } from 'sonner'

import {
  type TOfferLookupResponse,
  type TOfferStatus,
  offerErrors,
} from '../../shared'

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
  cn,
  formatLocalDateTime,
  withMinDelay,
} from '@/helpers/utils'
import { deleteOfferAction } from './delete-offer.action'

export const columns: ColumnDef<TOfferLookupResponse>[] = [
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
            href={`/dashboard/products/offers/${slug}`}
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
    accessorFn: row => row.target_items.length,
    id: 'stats_product_count',
    header: 'Items Count',
    cell: ({ row }) => row.original.target_items.length,
    meta: { minSize: 70, size: 70, filterVariant: 'range' },
  },
  {
    accessorFn: row => row.status,
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { status } = row.original
      const variant: Record<
        TOfferStatus,
        'default' | 'secondary' | 'destructive' | 'outline'
      > = {
        draft: 'outline',
        scheduled: 'outline',
        active: 'default',
        expired: 'secondary',
        paused: 'default',
      }

      return (
        <CellBadge
          data-is-drafted={status === 'draft'}
          className="data-[is-drafted=true]:text-black"
          variant={variant[status]}
        >
          {capitalizeWords(status)}
        </CellBadge>
      )
    },
    getUniqueValues: ({ status }) => [capitalizeWords(status)],
    filterFn: (row, columnId, filterValue) => {
      const rowValue = row.getValue(columnId) as TOfferStatus
      return capitalizeWords(rowValue) === capitalizeWords(filterValue)
    },
    meta: { minSize: 56, filterVariant: 'select' },
  },
  {
    accessorFn: row => row.discount,
    id: 'discount',
    header: 'Discount %',
    cell: ({ row }) => <Cell value={row.original.discount} />,
    meta: { minSize: 70, size: 70, filterVariant: 'range' },
  },
  {
    accessorKey: 'offer_start',
    id: 'offer_start',
    header: 'Date Start',
    cell: ({ row }) => {
      const { offer_start } = row.original
      // Use UTC for showing universal timezone
      const date = formatLocalDateTime(offer_start, 'date', 'UTC')
      const time = formatLocalDateTime(offer_start, 'time', 'UTC')

      return (
        <span className="text-muted-foreground inline-grid gap-0.5 text-center text-xs">
          <span>{date}</span>
          <span>{time}</span>
        </span>
      )
    },
    getUniqueValues: row => [
      formatLocalDateTime(row.offer_start, 'date', 'UTC'),
    ],
    filterFn: (row, columnId, filterValue) => {
      const rowValue = formatLocalDateTime(
        row.getValue(columnId) as Date,
        'date',
        'UTC',
      )
      return rowValue === filterValue
    },
    meta: { size: 48, filterVariant: 'select' },
  },
  {
    accessorKey: 'offer_end',
    id: 'offer_end',
    header: 'Date End',
    cell: ({ row }) => {
      const { offer_end } = row.original
      // Use UTC for showing universal timezone
      const date = formatLocalDateTime(offer_end, 'date', 'UTC')
      const time = formatLocalDateTime(offer_end, 'time', 'UTC')

      return (
        <span className="text-muted-foreground inline-grid gap-0.5 text-center text-xs">
          <span>{date}</span>
          <span>{time}</span>
        </span>
      )
    },
    getUniqueValues: row => [formatLocalDateTime(row.offer_end, 'date', 'UTC')],
    filterFn: (row, columnId, filterValue) => {
      const rowValue = formatLocalDateTime(
        row.getValue(columnId) as Date,
        'date',
        'UTC',
      )
      return rowValue === filterValue
    },
    meta: { size: 48, filterVariant: 'select' },
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
      // Didn't use UTC for showing local timezone
      const date = formatLocalDateTime(created_at, 'date')
      const time = formatLocalDateTime(created_at, 'time')

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
          .promise(withMinDelay(deleteOfferAction({ id, name }), 500), {
            loading: 'Deleting offer...',
            error: 'Failed to delete offer. Please try again.',
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
              ? offerErrors[result.errors.code].client
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

type CellType = {
  value: string | number
}
function Cell({ value }: CellType) {
  return (
    <span className="text-muted-foreground text-xs font-medium text-wrap">
      {value}
    </span>
  )
}

type CellBadgeType = React.ComponentProps<typeof Badge>
function CellBadge({ children, variant, className, ...props }: CellBadgeType) {
  return (
    <Badge
      {...props}
      variant={variant ?? 'outline'}
      className={cn('text-muted-foreground px-1.5', className)}
    >
      {children}
    </Badge>
  )
}
