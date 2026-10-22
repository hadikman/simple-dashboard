import {
  IconArrowDown,
  IconArrowRight,
  IconDotsVertical,
} from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { toast } from 'sonner'

import { HOME_DIRECTORY } from '@/views/media'

import type { TProductLookupResponseWithSubRows } from '../view-products.types'

import { deleteProductAction, productErrors } from '../../../shared'

import {
  CellBadge,
  CellInput,
  NO_SPECIFIED,
  SPECIFIED_VALUE_FOR_CATEGORIES,
} from '@/components/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  copyConfirmation,
  deleteConfirmation,
} from '@/helpers/confirmation-utils'
import { formatLocalDateTime, getFilename, withMinDelay } from '@/helpers/utils'
import { copyProductAction } from '../actions/copy-product.action'
import { updateProductPropAction } from '../actions/update-product-prop.action'

type CellStatus = 'Audit' | 'Draft' | 'Published'

export const columns: ColumnDef<TProductLookupResponseWithSubRows>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="ml-1 flex">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="ml-1 flex">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    meta: { minSize: 36, size: 36 },
  },
  {
    accessorKey: 'thumbnail_image',
    id: 'thumbnail_image',
    header: 'Image',
    cell: ({ row }) => {
      const thumbnail = row.original.thumbnail_image.src
      const thumbnailAlt = row.original.thumbnail_image.alt
      const title = row.original.title
      const src = thumbnail ? `/${HOME_DIRECTORY}/${thumbnail}` : undefined
      const alt = thumbnailAlt || getFilename(thumbnail)
      const fallback = title.slice(0, 2).toUpperCase()

      return (
        <Avatar className="size-10 rounded-lg grayscale hover:grayscale-0">
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
    accessorKey: 'title',
    id: 'title',
    minSize: 300,
    header: 'Title',
    cell: ({ column, row }) => {
      const {
        original,
        depth,
        getCanExpand,
        getToggleExpandedHandler,
        getIsExpanded,
      } = row
      const { title, slug, has_draft, is_published, product_group_id } =
        original

      let slugType = `/${slug}`

      const isAuditMode = has_draft && !is_published

      // For Expanded Row (has the same changes into all-products.page.tsx):
      // If subRows has published version the "depth === 0"
      // If subRows has draft version the "depth === 1"
      if (isAuditMode || (has_draft && depth === 1)) {
        const queryGroupId = `?group-id=${product_group_id}`
        slugType = '/draft' + slugType + queryGroupId
      }

      return (
        <div
          className="flex items-center"
          style={{ width: `${column.getSize()}px` }}
        >
          <Tooltip disableHoverableContent delayDuration={1000}>
            <TooltipTrigger asChild>
              <Button
                className="invisible mr-1.5 cursor-pointer data-[can-expand=true]:visible"
                data-can-expand={getCanExpand()}
                {...{
                  onClick: getToggleExpandedHandler(),
                }}
                variant="ghost"
                size="icon-xs"
              >
                {getIsExpanded() ? <IconArrowDown /> : <IconArrowRight />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {getIsExpanded() ? 'Hide Draft' : 'Show Draft'}
            </TooltipContent>
          </Tooltip>

          <Link
            href={`/dashboard/products/all-products${slugType}`}
            data-is-expanded-leaf={row.depth > 0}
            className="text-wrap hover:underline hover:underline-offset-4 data-[is-expanded-leaf=true]:ps-4"
          >
            {title}
          </Link>
        </div>
      )
    },
    enableHiding: false,
    meta: { filterVariant: 'text', header: 'Title' },
  },
  {
    accessorKey: 'brand_name',
    id: 'brand_name',
    header: 'Brand',
    cell: ({ row }) =>
      row.original.brand_name ? (
        <CellBadge>{row.original.brand_name}</CellBadge>
      ) : null,
    getUniqueValues: row => (row.brand_name ? [row.brand_name] : []),
    meta: { filterVariant: 'select', header: 'Brand' },
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
    accessorFn: row => {
      const { has_draft, is_published } = row
      const status =
        (has_draft && is_published && 'Draft') ||
        (has_draft && !is_published && 'Audit') ||
        'Published'

      return status
    },
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { original, depth } = row
      const { has_draft, is_published } = original
      let status: CellStatus
      const variant: Record<
        CellStatus,
        'default' | 'secondary' | 'destructive' | 'outline'
      > = {
        Audit: 'default',
        Draft: 'outline',
        Published: 'outline',
      }

      // For Expanded Row (has the same changes into all-products.page.tsx):
      // If subRows has published version the "depth === 0"
      // If subRows has draft version the "depth === 1"
      if (depth === 1) {
        status = has_draft && is_published ? 'Draft' : 'Published'
      } else {
        status = (has_draft && !is_published && 'Audit') || 'Published'
      }

      return (
        <CellBadge
          variant={variant[status]}
          data-is-audited={status === 'Audit'}
          data-is-drafted={status === 'Draft'}
          className="data-[is-audited=true]:text-white data-[is-drafted=true]:text-black"
        >
          {status}
        </CellBadge>
      )
    },
    meta: { filterVariant: 'select' },
  },

  {
    accessorFn: row => row.shipping.weight,
    id: 'shipping_weight',
    header: 'Weight',
    cell: ({ row, cell }) => (
      <form
        onSubmit={async e => {
          e.preventDefault()

          const value = Number(
            new FormData(e.currentTarget).get(cell.id)?.toString(),
          )
          if (!value || value === row.original.shipping.weight) return

          const { id, product_group_id, status } = row.original

          showToast({
            action: withMinDelay(
              updateProductPropAction({
                id,
                product_group_id,
                status,
                updatePropsData: { shipping: { weight: value } },
              }),
              800,
            ),
            loading: `Updating ${cell.column.columnDef.header} to ${value}`,
            error: 'Failed to update product prop. Please try again.',
            success: `The ${cell.column.columnDef.header} has been updated`,
            errorTitle: 'Failure to update the product prop',
          })
        }}
      >
        <CellInput
          id={cell.id}
          name={cell.id}
          type="number"
          defaultValue={row.original.shipping.weight}
        />
      </form>
    ),
    meta: { filterVariant: 'range' },
  },
  {
    accessorFn: row => row.shipping.dimensions.length,
    id: 'shipping_dimensions_length',
    header: 'Length',
    cell: ({ row, cell }) => (
      <form
        onSubmit={async e => {
          e.preventDefault()

          const value = Number(
            new FormData(e.currentTarget).get(cell.id)?.toString(),
          )
          if (!value || value === row.original.shipping.dimensions.length)
            return

          const { id, product_group_id, status } = row.original

          showToast({
            action: withMinDelay(
              updateProductPropAction({
                id,
                product_group_id,
                status,
                updatePropsData: {
                  shipping: { dimensions: { length: value } },
                },
              }),
              800,
            ),
            loading: `Updating ${cell.column.columnDef.header} to ${value}`,
            error: 'Failed to update product prop. Please try again.',
            success: `The ${cell.column.columnDef.header} has been updated`,
            errorTitle: 'Failure to update the product prop',
          })
        }}
      >
        <CellInput
          id={cell.id}
          name={cell.id}
          type="number"
          defaultValue={row.original.shipping.dimensions.length}
        />
      </form>
    ),
    meta: { filterVariant: 'range' },
  },
  {
    accessorFn: row => row.shipping.dimensions.width,
    id: 'shipping_dimensions_width',
    header: 'Width',
    cell: ({ row, cell }) => (
      <form
        onSubmit={async e => {
          e.preventDefault()

          const value = Number(
            new FormData(e.currentTarget).get(cell.id)?.toString(),
          )
          if (!value || value === row.original.shipping.dimensions.width) return

          const { id, product_group_id, status } = row.original

          showToast({
            action: withMinDelay(
              updateProductPropAction({
                id,
                product_group_id,
                status,
                updatePropsData: {
                  shipping: { dimensions: { width: value } },
                },
              }),
              800,
            ),
            loading: `Updating ${cell.column.columnDef.header} to ${value}`,
            error: 'Failed to update product prop. Please try again.',
            success: `The ${cell.column.columnDef.header} has been updated`,
            errorTitle: 'Failure to update the product prop',
          })
        }}
      >
        <CellInput
          id={cell.id}
          name={cell.id}
          type="number"
          defaultValue={row.original.shipping.dimensions.width}
        />
      </form>
    ),
    meta: { filterVariant: 'range' },
  },
  {
    accessorFn: row => row.shipping.dimensions.height,
    id: 'shipping_dimensions_height',
    header: 'Height',
    cell: ({ row, cell }) => (
      <form
        onSubmit={async e => {
          e.preventDefault()

          const value = Number(
            new FormData(e.currentTarget).get(cell.id)?.toString(),
          )
          if (!value || value === row.original.shipping.dimensions.height)
            return

          const { id, product_group_id, status } = row.original

          showToast({
            action: withMinDelay(
              updateProductPropAction({
                id,
                product_group_id,
                status,
                updatePropsData: {
                  shipping: { dimensions: { height: value } },
                },
              }),
              800,
            ),
            loading: `Updating ${cell.column.columnDef.header} to ${value}`,
            error: 'Failed to update product prop. Please try again.',
            success: `The ${cell.column.columnDef.header} has been updated`,
            errorTitle: 'Failure to update the product prop',
          })
        }}
      >
        <CellInput
          id={cell.id}
          name={cell.id}
          type="number"
          defaultValue={row.original.shipping.dimensions.height}
        />
      </form>
    ),
    meta: { filterVariant: 'range' },
  },
  {
    accessorKey: 'published_at',
    id: 'published_at',
    header: 'Publish',
    cell: ({ row }) => {
      const { published_at } = row.original
      if (!published_at) return

      const date = formatLocalDateTime(published_at, 'date')
      const time = formatLocalDateTime(published_at, 'time')

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
      const isDisabled = !!row.depth // Disable for subRows

      async function handleCopy() {
        const { id, title } = row.original

        const confirmed = await copyConfirmation(title)
        if (!confirmed) return

        const copyProductData = { id }

        const result = await toast
          .promise(withMinDelay(copyProductAction(copyProductData), 500), {
            loading: 'Copying product...',
            error: 'Failed to copy product. Please try again.',
          })
          .unwrap()

        if (result.success) {
          toast.success(`The ${title} has been copied`, {
            duration: 1200,
          })
          table.setRowSelection({})
        } else {
          toast.error(`Failure to copy the ${title}`, {
            description: result.errors.code
              ? productErrors[result.errors.code].client
              : 'Please try again!',
            duration: 3000,
          })
        }
      }

      async function handleDelete() {
        const { id, product_group_id, title, has_draft } = row.original

        const confirmed = await deleteConfirmation(title)
        if (!confirmed) return

        const deleteProductData = {
          id,
          productGroupId: product_group_id,
          title: title,
          hasDraft: has_draft,
        }

        const result = await toast
          .promise(withMinDelay(deleteProductAction(deleteProductData), 500), {
            loading: 'Deleting product...',
            error: 'Failed to delete product. Please try again.',
          })
          .unwrap()

        if (result.success) {
          toast.success(`The ${title} has been deleted`, {
            duration: 1200,
          })
          table.setRowSelection({})
          table.setExpanded({})
        } else {
          toast.error(`Failure to delete the ${title}`, {
            description: result.errors.code
              ? productErrors[result.errors.code].client
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
            <DropdownMenuItem disabled={isDisabled} onClick={handleCopy}>
              Make a copy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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

type ShowToastProps = {
  action: ReturnType<typeof updateProductPropAction>
  loading: string
  error: string
  success: string
  errorTitle: string
}
async function showToast({
  action,
  loading,
  error,
  success,
  errorTitle,
}: ShowToastProps) {
  const result = await toast
    .promise(action, {
      loading,
      error,
    })
    .unwrap()

  if (result.success) {
    toast.success(success, {
      duration: 1200,
    })
  } else {
    toast.error(errorTitle, {
      description: result.errors.code
        ? productErrors[result.errors.code].client
        : 'Please try again!',
      duration: 3000,
    })
  }
}
