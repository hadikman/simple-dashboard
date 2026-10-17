import { IconDotsVertical } from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import React from 'react'
import { toast } from 'sonner'

import { HOME_DIRECTORY } from '@/views/media'

import { type TBrandLookupResponse, brandErrors } from '../../shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NO_SPECIFIED,
  SPECIFIED_VALUE_FOR_CATEGORIES,
} from '@/constants/common.constants'
import { deleteConfirmation } from '@/helpers/confirmation-utils'
import { cn, getFilename, withMinDelay } from '@/helpers/utils'
import { deleteBrandAction } from './delete-brand.action'

export const columns: ColumnDef<TBrandLookupResponse>[] = [
  {
    accessorKey: 'thumbnail_image',
    id: 'thumbnail_image',
    header: 'Image',
    cell: ({ row }) => {
      const thumbnail = row.original.logo.src
      const thumbnailAlt = row.original.logo.alt
      const title = row.original.name
      const src = thumbnail ? `/${HOME_DIRECTORY}/${thumbnail}` : undefined
      const alt = thumbnailAlt || getFilename(thumbnail)
      const fallback = title.slice(0, 2).toUpperCase()

      return (
        // If margin start need to change, it must change into first th into thead too
        <Avatar className="ms-1 h-10 w-10 rounded-lg grayscale hover:grayscale-0">
          <AvatarImage className="object-contain" src={src} alt={alt} />
          <AvatarFallback className="rounded-lg text-sm">
            {fallback}
          </AvatarFallback>
        </Avatar>
      )
    },
    enableSorting: false,
    enableColumnFilter: false,
    meta: { size: 40 },
  },
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
            href={`/dashboard/products/brands/${slug}`}
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
    accessorKey: 'description',
    id: 'description',
    minSize: 320,
    header: 'Description',
    cell: ({ row }) => <Cell value={row.original.description} />,
    meta: { filterVariant: 'text', header: 'Description' },
  },
  {
    accessorFn: row => row.categories.map(({ name }) => name),
    id: 'categories',
    header: 'Categories',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.categories.map(({ id, name }) => (
          <CellBadge key={id}>{name}</CellBadge>
        ))}
      </div>
    ),
    getUniqueValues: row => {
      const names = row.categories.map(({ name }) => name)

      if (row.categories.length === 0) {
        names.push(NO_SPECIFIED) // Add NO_SPECIFIED for not specified categories
      }

      return names
    },
    filterFn: (row, columnId, filterValue) => {
      const rowValues = row.getValue(columnId) as string[]
      const subRows = row.originalSubRows

      if (filterValue === SPECIFIED_VALUE_FOR_CATEGORIES) {
        if (rowValues.length === 0) return true
      }

      if (subRows?.length) {
        return (
          subRows[0].categories.map(({ name }) => name).includes(filterValue) ??
          false
        )
      } else {
        return rowValues.includes(filterValue) ?? false
      }
    },
    enableSorting: false,
    meta: {
      minSize: 200,
      size: 200,
      filterVariant: 'select',
      header: 'Categories',
    },
  },
  {
    accessorKey: 'website',
    id: 'website',
    minSize: 240,
    header: 'Website',
    cell: ({ row }) => <Cell value={row.original.website} />,
    meta: { filterVariant: 'text', header: 'Website' },
  },
  {
    accessorKey: 'email',
    id: 'email',
    minSize: 240,
    header: 'Email',
    cell: ({ row }) => <Cell value={row.original.email} />,
    meta: { filterVariant: 'text', header: 'Email' },
  },
  {
    accessorFn: row => row.stats.product_count,
    id: 'stats_product_count',
    header: 'Product Count',
    cell: ({ row }) => row.original.stats.product_count,
    meta: { filterVariant: 'range' },
  },
  {
    accessorFn: row => row.stats.total_sales,
    id: 'stats_total_sales',
    header: 'Total Sales',
    cell: ({ row }) => row.original.stats.total_sales,
    meta: { filterVariant: 'range' },
  },
  {
    accessorFn: row => row.stats.average_rating,
    id: 'stats_average_rating',
    header: 'Average Rating',
    cell: ({ row }) => row.original.stats.average_rating,
    meta: { filterVariant: 'range' },
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

        const deleteBrandData = { id, name }

        const result = await toast
          .promise(withMinDelay(deleteBrandAction(deleteBrandData), 500), {
            loading: 'Deleting brand...',
            error: 'Failed to delete brand. Please try again.',
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
              ? brandErrors[result.errors.code].client
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
  value: string
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
