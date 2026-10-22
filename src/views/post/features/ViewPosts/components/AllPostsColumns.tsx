import {
  IconArrowDown,
  IconArrowRight,
  IconDotsVertical,
} from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { toast } from 'sonner'

import { HOME_DIRECTORY } from '@/views/media'

import { type TPostLookupResponseWithSubRows } from '../view-posts.types'

import { deletePostAction, postErrors } from '../../../shared'

import {
  CellBadge,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { deleteConfirmation } from '@/helpers/confirmation-utils'
import { formatLocalDateTime, getFilename, withMinDelay } from '@/helpers/utils'

type CellStatus = 'Audit' | 'Draft' | 'Published'

export const columns: ColumnDef<TPostLookupResponseWithSubRows>[] = [
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
      const { title, slug, has_draft, is_published, post_group_id } = original

      let slugType = `/${slug}`

      const isAuditMode = has_draft && !is_published

      // For Expanded Row (has the same changes into all-posts.page.tsx):
      // If subRows has published version the "depth === 0"
      // If subRows has draft version the "depth === 1"
      if (isAuditMode || (has_draft && depth === 1)) {
        const queryGroupId = `?group-id=${post_group_id}`
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
            href={`/dashboard/posts/all-posts${slugType}`}
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

      // For Expanded Row (has the same changes into all-posts.page.tsx):
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
      async function handleDelete() {
        const { id, post_group_id, title, has_draft } = row.original

        const confirmed = await deleteConfirmation(title)
        if (!confirmed) return

        const deletePostData = {
          id,
          postGroupId: post_group_id,
          title: title,
          hasDraft: has_draft,
        }

        const result = await toast
          .promise(withMinDelay(deletePostAction(deletePostData), 500), {
            loading: 'Deleting post...',
            error: 'Failed to delete post. Please try again.',
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
              ? postErrors[result.errors.code].client
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
