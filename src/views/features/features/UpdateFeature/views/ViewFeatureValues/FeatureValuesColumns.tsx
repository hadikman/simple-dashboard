import type { ColumnDef } from '@tanstack/react-table'
import { MoreVerticalIcon, XIcon } from 'lucide-react'

import { type IFeatureValue } from '../../../../shared'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import './feature-values-table-meta.types'

export const featureValuesColumns: ColumnDef<IFeatureValue>[] = [
  {
    id: 'row_number',
    header: () => null,
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {row.index + 1}
      </span>
    ),
    enableColumnFilter: false,
    enableHiding: false,
    meta: { size: 48, minSize: 48 },
  },
  {
    accessorKey: 'value',
    id: 'value',
    header: 'Items',
    cell: ({ row, table }) => {
      const meta = table.options.meta?.featureValues
      if (!meta) return row.original.value

      const { id, value } = row.original
      const { editId, setEditId, form } = meta

      const isEditing = id === editId

      return (
        <div
          data-edit={isEditing}
          className="data-[edit=true]:flex data-[edit=true]:gap-2 data-[edit=true]:@max-xl/table:flex-col @max-md/table:whitespace-pre-wrap data-[edit=true]:@xl/table:items-center"
        >
          {value}
          {isEditing ? (
            <form
              id="update-value-form"
              className="flex w-full items-center gap-2 @xl/table:pl-4"
              onSubmit={e => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <form.AppField name="value">
                {field => (
                  <InputGroup className="h-8 flex-1">
                    <InputGroupInput
                      value={field.state.value}
                      autoFocus
                      onChange={e => field.handleChange(e.target.value)}
                    />
                    {field.state.value ? (
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => field.handleChange('')}
                        >
                          <XIcon />
                          <span className="sr-only">Clear</span>
                        </Button>
                      </InputGroupAddon>
                    ) : null}
                  </InputGroup>
                )}
              </form.AppField>

              <form.AppForm>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    form.reset()
                    setEditId(undefined)
                  }}
                >
                  <XIcon />
                  <span className="sr-only">Cancel</span>
                </Button>
              </form.AppForm>
            </form>
          ) : null}
        </div>
      )
    },
    enableHiding: false,
    meta: { filterVariant: 'text', header: 'Items' },
  },
  {
    id: 'actions',
    header: () => null,
    cell: ({ row, table }) => {
      const meta = table.options.meta?.featureValues
      if (!meta) return null

      const { id, value } = row.original
      const { setEditId, onDelete } = meta

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground size-8"
              size="icon"
            >
              <MoreVerticalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => setEditId(id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Make a copy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(id, value)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
    meta: { size: 48, minSize: 48 },
  },
]
