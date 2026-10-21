'use client'

import { IconRowRemove } from '@tabler/icons-react'
import { toast } from 'sonner'

import type { Table } from '@tanstack/react-table'

import { type TPostLookupResponseWithSubRowsData } from '../view-posts.types'

import { type TPostLookupDataWithId, postErrors } from '../../../shared'

import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { deleteConfirmation } from '@/helpers/confirmation-utils'
import { withMinDelay } from '@/helpers/utils'
import { deletePostsAction } from '../delete-posts.action'
import { columns } from './AllPostsColumns'

const defaultColumnVisibility = {
  inventory_stock_quantity: false,
  shipping_weight: false,
  shipping_dimensions_length: false,
  shipping_dimensions_width: false,
  shipping_dimensions_height: false,
}

type AllPostsTableType = {
  postsData: TPostLookupResponseWithSubRowsData
}

export function AllPostsTable({ postsData }: AllPostsTableType) {
  return (
    <DataTable
      data={postsData}
      columns={columns}
      defaultColumnVisibility={defaultColumnVisibility}
      persistKeys={{
        visibility: 'all-posts-visibility',
        filter: 'all-posts-filter',
        pagination: 'all-posts-pagination',
        selection: 'all-posts-selection',
      }}
      enableExpanding
      enableRowSelection
      getSubRows={row => row.subRows}
      defaultColumnMinSize={110}
      toolbarActions={({ table, rowSelection }) => (
        <DeletePostsButton
          table={table}
          selectedCount={Object.keys(rowSelection).length}
        />
      )}
    />
  )
}

type DeletePostsButtonProps = {
  table: Table<TPostLookupDataWithId>
  selectedCount: number
}

function DeletePostsButton({ table, selectedCount }: DeletePostsButtonProps) {
  async function handleClick() {
    const count = table.getSelectedRowModel().flatRows.length
    const isMultiSelection = count > 1
    const counts = isMultiSelection ? count + ' ' : ''
    const pluralS = isMultiSelection ? 's' : ''

    const confirmed = await deleteConfirmation(`${counts}Post${pluralS}`)
    if (!confirmed) return

    const deletePostsData = table
      .getSelectedRowModel()
      .flatRows.map(
        ({
          original: { id, post_group_id, has_draft, is_published },
          parentId,
        }) => ({
          id,
          postGroupId: post_group_id,
          hasDraft: has_draft,
          isPublished: is_published,
          onlyDeleteDraft: Boolean(parentId),
        }),
      )

    const result = await toast
      .promise(withMinDelay(deletePostsAction(deletePostsData), 500), {
        loading: `Deleting ${count} post${pluralS}...`,
        error: 'Failed to delete posts. Please try again.',
      })
      .unwrap()

    if (result.success) {
      toast.success(`The ${count} post${pluralS} have been deleted`, {
        duration: 1200,
      })

      table.setRowSelection({})
      table.setExpanded({})
    } else {
      toast.error(`Failure to delete the ${count} post${pluralS}`, {
        description: result.errors.code
          ? postErrors[result.errors.code].client
          : 'Please try again!',
        duration: 3000,
      })
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={selectedCount === 0}
      onClick={handleClick}
    >
      <IconRowRemove />
      <span className="hidden lg:inline">Delete Posts</span>
      <span className="lg:hidden">Delete</span>
    </Button>
  )
}
