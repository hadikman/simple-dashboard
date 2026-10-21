'use client'

import { IconRowRemove } from '@tabler/icons-react'
import { toast } from 'sonner'

import type { Table } from '@tanstack/react-table'

import {
  type TProductLookupDataWithId,
  deleteProductsAction,
  productErrors,
} from '../../../shared'

import { type TProductLookupResponseWithSubRowsData } from '../view-products.types'

import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { deleteConfirmation } from '@/helpers/confirmation-utils'
import { withMinDelay } from '@/helpers/utils'
import { columns } from './AllProductsColumns'

const defaultColumnVisibility = {
  shipping_weight: false,
  shipping_dimensions_length: false,
  shipping_dimensions_width: false,
  shipping_dimensions_height: false,
}

type AllProductsTableProps = {
  productsData: TProductLookupResponseWithSubRowsData
}

export function AllProductsTable({ productsData }: AllProductsTableProps) {
  return (
    <DataTable
      data={productsData}
      columns={columns}
      defaultColumnVisibility={defaultColumnVisibility}
      persistKeys={{
        visibility: 'all-products-visibility',
        filter: 'all-products-filter',
        pagination: 'all-products-pagination',
        selection: 'all-products-selection',
      }}
      enableExpanding
      enableRowSelection
      getSubRows={row => row.subRows}
      defaultColumnMinSize={110}
      toolbarActions={({ table, rowSelection }) => (
        <DeleteProductsButton
          table={table}
          selectedCount={Object.keys(rowSelection).length}
        />
      )}
    />
  )
}

type DeleteProductsButtonProps = {
  table: Table<TProductLookupDataWithId>
  selectedCount: number
}

function DeleteProductsButton({
  table,
  selectedCount,
}: DeleteProductsButtonProps) {
  async function handleClick() {
    const count = table.getSelectedRowModel().flatRows.length
    const isMultiSelection = count > 1
    const counts = isMultiSelection ? count + ' ' : ''
    const pluralS = isMultiSelection ? 's' : ''

    const confirmed = await deleteConfirmation(`${counts}Product${pluralS}`)
    if (!confirmed) return

    const deleteProductsData = table
      .getSelectedRowModel()
      .flatRows.map(({ original, parentId }) => ({
        id: original.id,
        productGroupId: original.product_group_id,
        hasDraft: original.has_draft,
        isPublished: original.is_published,
        onlyDeleteDraft: Boolean(parentId),
      }))

    const result = await toast
      .promise(withMinDelay(deleteProductsAction(deleteProductsData), 500), {
        loading: `Deleting ${count} product${pluralS}...`,
        error: 'Failed to delete products. Please try again.',
      })
      .unwrap()

    if (result.success) {
      toast.success(`The ${count} product${pluralS} have been deleted`, {
        duration: 1200,
      })
      table.resetRowSelection()
      table.resetExpanded()
    } else {
      toast.error(`Failure to delete the ${count} product${pluralS}`, {
        description: result.errors.code
          ? productErrors[result.errors.code].client
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
      <span className="hidden lg:inline">Delete Products</span>
      <span className="lg:hidden">Delete</span>
    </Button>
  )
}
