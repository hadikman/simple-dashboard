'use client'

import {
  IconArrowDown,
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconArrowRight,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconFilter,
  IconFilterSearch,
  IconLayoutColumns,
  IconX,
} from '@tabler/icons-react'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type ExpandedState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import React from 'react'

import type { Column, ColumnMeta } from '@tanstack/react-table'

import '@/components/data-table/table-custom-properties.types'
import type { DataTableProps } from './types'

import { DebouncedInput } from '@/components/debounced-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { capitalizeWords } from '@/helpers/utils'
import { usePersistStorage } from '@/hooks/use-persist-storage'
import {
  NO_SPECIFIED,
  SPECIFIED_LABEL_FOR_APP_CAT,
  SPECIFIED_VALUE_FOR_CATEGORIES,
} from './table.constants'

const STRINGIFIED_EMPTY_ARRAY = JSON.stringify([])
const STRINGIFIED_EMPTY_OBJECT = JSON.stringify({})

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 }
const STRINGIFIED_DEFAULT_PAGINATION = JSON.stringify(DEFAULT_PAGINATION)

export function DataTable<TData>({
  data: rawData,
  columns,
  defaultColumnVisibility = {},
  persistKeys,
  enableExpanding = false,
  enableRowSelection = false,
  getSubRows,
  defaultColumnMinSize,
  toolbarActions,
  tableMeta,
}: DataTableProps<TData>) {
  const data = React.useMemo(() => rawData, [rawData])
  const stringifiedDefaultVisibility = React.useMemo(
    () => JSON.stringify(defaultColumnVisibility),
    [defaultColumnVisibility],
  )

  const {
    value: rowSelection,
    set: setRowSelection,
    clear: clearRowSelectionStore,
  } = usePersistStorage<RowSelectionState>({
    key: persistKeys.selection ?? 'selection',
    initialState: {},
    enableUrlStore: true,
  })
  React.useEffect(() => {
    if (JSON.stringify(rowSelection) === STRINGIFIED_EMPTY_OBJECT) {
      clearRowSelectionStore()
    }
  }, [clearRowSelectionStore, rowSelection])

  const {
    value: columnVisibility,
    set: setColumnVisibility,
    clear: clearColumnVisibilityStore,
  } = usePersistStorage<VisibilityState>({
    key: persistKeys.visibility,
    initialState: defaultColumnVisibility,
    storage: 'localStorage',
    enableUrlStore: true,
  })
  React.useEffect(() => {
    if (JSON.stringify(columnVisibility) === stringifiedDefaultVisibility) {
      clearColumnVisibilityStore()
    }
  }, [
    clearColumnVisibilityStore,
    columnVisibility,
    stringifiedDefaultVisibility,
  ])

  const {
    value: columnFilters,
    set: setColumnFilters,
    clear: clearColumnFiltersStore,
  } = usePersistStorage<ColumnFiltersState>({
    key: persistKeys.filter ?? 'filter',
    initialState: [],
    enableUrlStore: true,
  })
  React.useEffect(() => {
    if (JSON.stringify(columnFilters) === STRINGIFIED_EMPTY_ARRAY) {
      clearColumnFiltersStore()
    }
  }, [clearColumnFiltersStore, columnFilters])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [expanded, setExpanded] = React.useState<ExpandedState>({})

  const {
    value: pagination,
    set: setPagination,
    clear: clearPaginationStore,
  } = usePersistStorage<PaginationState>({
    key: persistKeys.pagination ?? 'pagination',
    initialState: DEFAULT_PAGINATION,
    enableUrlStore: true,
  })
  React.useEffect(() => {
    if (JSON.stringify(pagination) === STRINGIFIED_DEFAULT_PAGINATION) {
      clearPaginationStore()
    }
  }, [clearPaginationStore, pagination])

  const table = useReactTable({
    data,
    columns,
    ...(defaultColumnMinSize && {
      defaultColumn: { minSize: defaultColumnMinSize },
    }),
    state: {
      rowSelection,
      columnVisibility,
      columnFilters,
      sorting,
      ...(enableExpanding && { expanded }),
      pagination,
    },
    meta: tableMeta,
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    ...(enableExpanding && {
      onExpandedChange: setExpanded,
      getSubRows,
      getExpandedRowModel: getExpandedRowModel(),
    }),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  // Expose a way to reset selection + expanded (used by delete handlers)
  React.useImperativeHandle(
    // optional: can expose via ref if needed
    undefined,
    () => ({
      resetSelection: () => {
        setRowSelection({})
        setExpanded({})
      },
    }),
  )

  const isDefaultVisibility =
    JSON.stringify(columnVisibility) === stringifiedDefaultVisibility
  const hasCustomizableColumns = Object.keys(defaultColumnVisibility).length > 0

  return (
    <div className="relative flex flex-col gap-4 overflow-auto p-1">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {toolbarActions?.({ table, rowSelection })}
        </div>

        <div className={toolbarActions ? '' : 'ms-auto'}>
          <DropdownMenu>
            <DropdownMenuTrigger disabled={!hasCustomizableColumns} asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuCheckboxItem
                  disabled={isDefaultVisibility}
                  onCheckedChange={() =>
                    table.setColumnVisibility(defaultColumnVisibility)
                  }
                >
                  Reset
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {table
                  .getAllColumns()
                  .filter(
                    column =>
                      typeof column.accessorFn !== 'undefined' &&
                      column.getCanHide(),
                  )
                  .map(column => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(value)}
                    >
                      {column.columnDef.header?.toString()}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filters + Table */}
      <div className="space-y-2">
        <div className="group/active-filter has-data-[has-filter=true]:border-border border-border/50 flex items-center gap-4 rounded-lg border px-3 py-2">
          <Label className="text-muted-foreground group-has-data-[has-filter=true]/active-filter:text-foreground text-sm font-medium">
            Filters
          </Label>
          <div className="flex h-5.5 gap-1.5">
            {table.getAllLeafColumns().map(column => {
              const { id, getFilterValue, getIsFiltered, setFilterValue } =
                column
              const filterValue = getFilterValue() as string
              return getFilterValue() ? (
                <Badge
                  key={id}
                  data-has-filter={getIsFiltered()}
                  className="border-border flex gap-2"
                  variant="secondary"
                >
                  <span>{filterValue}</span>
                  <span
                    className="flex w-3 cursor-pointer"
                    onClick={() => setFilterValue('')}
                  >
                    <IconX className="size-auto" />
                  </span>
                </Badge>
              ) : null
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const { id, colSpan, isPlaceholder, column, getContext } =
                      header
                    const {
                      columnDef: { meta },
                      getCanSort,
                      getToggleSortingHandler,
                      getNextSortingOrder,
                      getIsSorted,
                      getCanFilter,
                      getIsFiltered,
                    } = column

                    return (
                      <TableHead
                        key={id}
                        colSpan={colSpan}
                        style={
                          meta?.size || meta?.minSize
                            ? {
                                ...(meta?.size && { width: `${meta.size}px` }),
                                ...(meta?.minSize && {
                                  minWidth: `${meta.minSize}px`,
                                }),
                              }
                            : { minWidth: `${column.getSize()}px` }
                        }
                      >
                        <div
                          data-is-visibled-by-user={
                            columnVisibility[id] &&
                            id in defaultColumnVisibility
                          }
                          className="data-[is-visibled-by-user=true]:border-t-ring flex h-full items-center data-[is-visibled-by-user=true]:border-t-2 data-[is-visibled-by-user=true]:pt-0"
                        >
                          {/* Expand all button (only on 'title' col when expanding is enabled) */}
                          {enableExpanding && column.id === 'title' ? (
                            table.getCanSomeRowsExpand() ? (
                              <Tooltip
                                disableHoverableContent
                                delayDuration={1000}
                              >
                                <TooltipTrigger asChild>
                                  <Button
                                    className="mr-1 cursor-pointer"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={table.getToggleAllRowsExpandedHandler()}
                                  >
                                    {table.getIsAllRowsExpanded() ? (
                                      <IconArrowDown />
                                    ) : (
                                      <IconArrowRight />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {table.getIsAllRowsExpanded()
                                    ? 'Hide All Drafts'
                                    : 'Show All Drafts'}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Button className="invisible mr-1" size="icon-xs">
                                <IconArrowRight />
                              </Button>
                            )
                          ) : null}

                          <div className="flex w-full items-center justify-between">
                            {getCanSort() ? (
                              <Tooltip
                                disableHoverableContent
                                delayDuration={200}
                              >
                                <TooltipTrigger asChild>
                                  <div
                                    className="flex cursor-pointer items-center gap-1 underline underline-offset-2 select-none"
                                    onClick={getToggleSortingHandler()}
                                  >
                                    {isPlaceholder
                                      ? null
                                      : flexRender(
                                          column.columnDef.header,
                                          getContext(),
                                        )}
                                    <span
                                      data-has-sorted={getIsSorted() !== false}
                                      className="invisible flex w-3 data-[has-sorted=true]:visible"
                                    >
                                      {
                                        {
                                          asc: (
                                            <IconArrowNarrowUp className="size-auto" />
                                          ),
                                          desc: (
                                            <IconArrowNarrowDown className="size-auto" />
                                          ),
                                        }[getIsSorted() as string]
                                      }
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  {
                                    {
                                      asc: 'Sort ascending',
                                      desc: 'Sort descending',
                                      false: 'Clear sort',
                                    }[getNextSortingOrder() as string]
                                  }
                                </TooltipContent>
                              </Tooltip>
                            ) : isPlaceholder ? null : (
                              flexRender(column.columnDef.header, getContext())
                            )}

                            {getCanFilter() ? (
                              <span
                                data-has-filter={getIsFiltered()}
                                className="group/filter flex items-center gap-1"
                              >
                                <Filter column={column} />
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    data-is-expanded-leaf={row.depth > 0}
                    className="data-[is-expanded-leaf=true]:bg-muted-foreground/7"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div
        data-disable-pagination={
          !table.getCanPreviousPage() && !table.getCanNextPage()
        }
        className="group/toolbar flex items-center justify-between px-4 py-1"
      >
        {enableRowSelection && (
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        )}
        <div className="ml-auto flex w-full items-center gap-8 select-none lg:w-fit">
          {/* Rows Selection Info */}
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={value => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Navigation */}
          <div className="group-data-[disable-pagination=true]/toolbar:text-muted-foreground flex w-fit items-center justify-center gap-2.5 text-sm font-medium">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <form
                className="flex items-center gap-1"
                onSubmit={e => {
                  e.preventDefault()

                  const value = Number(
                    new FormData(e.currentTarget).get('go-to-page'),
                  )
                  if (!value) return

                  table.setPageIndex(value - 1)
                  table.toggleAllPageRowsSelected(false)
                }}
              >
                <Label htmlFor="go-to-page" className="text-sm">
                  Go to page
                </Label>
                <Input
                  id="go-to-page"
                  name="go-to-page"
                  type="number"
                  min="1"
                  max={table.getPageCount()}
                  defaultValue={table.getState().pagination.pageIndex + 1}
                  disabled={
                    !table.getCanPreviousPage() && !table.getCanNextPage()
                  }
                  className="h-auto w-16 rounded-md border"
                />
              </form>
            </span>
          </div>

          {/* Pagination */}
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                table.setPageIndex(0)
                table.toggleAllPageRowsSelected(false)
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => {
                table.previousPage()
                table.toggleAllPageRowsSelected(false)
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => {
                table.nextPage()
                table.toggleAllPageRowsSelected(false)
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => {
                table.setPageIndex(table.getPageCount() - 1)
                table.toggleAllPageRowsSelected(false)
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Filter<TData>({ column }: { column: Column<TData, unknown> }) {
  const {
    columnDef,
    getFilterValue,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    setFilterValue,
    id,
  } = column
  const { filterVariant } = columnDef.meta ?? {}

  const columnFilterValue = getFilterValue()
  const facetedUniqueValues = getFacetedUniqueValues()

  const sortedUniqueValues = React.useMemo(() => {
    if (filterVariant === 'range') return []

    const slicedUniqueValues = Array.from(facetedUniqueValues.keys())
      .sort()
      .slice(0, 2000)

    if (id === 'categories') {
      if (slicedUniqueValues.includes(NO_SPECIFIED)) {
        slicedUniqueValues.pop() // Remove NO_SPECIFIED
        slicedUniqueValues.unshift(SPECIFIED_VALUE_FOR_CATEGORIES)
      }
    }

    if (id === 'applicable_category_name') {
      if (slicedUniqueValues.includes(NO_SPECIFIED)) {
        slicedUniqueValues.pop() // Remove NO_SPECIFIED
        slicedUniqueValues.unshift(SPECIFIED_LABEL_FOR_APP_CAT)
      }
    }
    return slicedUniqueValues
  }, [facetedUniqueValues, filterVariant, id])

  const isNone = sortedUniqueValues.length === 0
  const isNoneOrSingle = sortedUniqueValues.length <= 1

  if (filterVariant === 'range') {
    return (
      <Dropdown
        filterVariant={filterVariant}
        renderItems={
          <div className="flex space-x-2">
            <DebouncedInput
              type="number"
              min={Number(getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(getFacetedMinMaxValues()?.[1] ?? '')}
              value={(columnFilterValue as [number, number])?.[0] ?? ''}
              onChange={value =>
                setFilterValue((old: [number, number]) => [value, old?.[1]])
              }
              placeholder={`Min ${
                getFacetedMinMaxValues()?.[0] !== undefined
                  ? `(${getFacetedMinMaxValues()?.[0]})`
                  : ''
              }`}
              className="w-30 rounded border shadow"
            />
            <DebouncedInput
              type="number"
              min={Number(getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(getFacetedMinMaxValues()?.[1] ?? '')}
              value={(columnFilterValue as [number, number])?.[1] ?? ''}
              onChange={value =>
                setFilterValue((old: [number, number]) => [old?.[0], value])
              }
              placeholder={`Max ${
                getFacetedMinMaxValues()?.[1]
                  ? `(${getFacetedMinMaxValues()?.[1]})`
                  : ''
              }`}
              className="w-30 rounded border shadow"
            />
          </div>
        }
      />
    )
  }

  if (filterVariant === 'select') {
    return (
      <Dropdown
        filterVariant={filterVariant}
        isDisabled={isNoneOrSingle}
        renderItems={sortedUniqueValues.map(value => (
          <DropdownMenuItem
            key={value as string}
            onClick={() => setFilterValue(value)}
          >
            {value as string}
          </DropdownMenuItem>
        ))}
      />
    )
  }

  if (filterVariant === 'text') {
    return (
      <Dropdown
        filterVariant={filterVariant}
        icon={IconFilterSearch}
        isDisabled={isNone}
        renderItems={
          <Autocomplete
            column={column}
            sortedUniqueValues={sortedUniqueValues}
          />
        }
      />
    )
  }

  return null
}

type DropdownProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterVariant: ColumnMeta<any, unknown>['filterVariant']
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  isDisabled?: boolean
  renderItems: React.ReactNode
}
function Dropdown({
  filterVariant,
  icon,
  isDisabled,
  renderItems,
}: DropdownProps) {
  const [open, setOpen] = React.useState(false)
  const Icon = icon || IconFilter

  return (
    <>
      <Tooltip disableHoverableContent delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            className="text-muted-foreground cursor-pointer"
            variant="ghost"
            size="icon-xs"
            disabled={isDisabled}
            onClick={() => setOpen(true)}
          >
            <Icon className="group-data-[has-filter=true]/filter:fill-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{`${capitalizeWords(filterVariant!)} Filter`}</TooltipContent>
      </Tooltip>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="-ms-2" />
        <DropdownMenuContent className="w-fit" align="end">
          {renderItems}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

type AutocompleteType<TData> = {
  column: Column<TData, unknown>
  sortedUniqueValues: unknown[]
}
function Autocomplete<TData>({
  column,
  sortedUniqueValues,
}: AutocompleteType<TData>) {
  const [commandFilterValue, setCommandFilterValue] = React.useState<string>()
  const { getFilterValue, getFacetedUniqueValues, columnDef, setFilterValue } =
    column
  const columnFilterValue = getFilterValue()
  const count = getFacetedUniqueValues().size

  return (
    <Command
      value={commandFilterValue || ((columnFilterValue ?? '') as string)}
      onValueChange={setCommandFilterValue}
    >
      <CommandInput
        placeholder={`Search in ${count} ${columnDef.meta?.header}`}
      />
      <CommandList className="w-3xs md:w-sm">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {sortedUniqueValues.map(value => (
            <CommandItem
              key={value as string}
              value={value as string}
              onSelect={currentValue => {
                setFilterValue(currentValue)
                // cmdk consumes Enter so Radix DropdownMenu won't auto-close.
                // Dispatch Escape to close it programmatically.
                document.dispatchEvent(
                  new KeyboardEvent('keydown', { key: 'Escape' }),
                )
              }}
            >
              {value as string}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
