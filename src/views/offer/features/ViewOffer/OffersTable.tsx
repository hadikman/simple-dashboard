'use client'

import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
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
  Column,
  ColumnFiltersState,
  ColumnMeta,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import React from 'react'

import { type TProductLookupDataWithId } from '@/views/product'

import { type TOfferLookupResponse } from '../../shared'

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
import { capitalizeWords, formatLocalDateTime } from '@/helpers/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { usePersistStorage } from '@/hooks/use-persist-storage'
import { columns } from './OffersColumns'

const defaultColumnVisibility = {
  description: false,
}
const defaultPagination = {
  pageIndex: 0,
  pageSize: 10,
}

const stringfiedArray = JSON.stringify([])
const stringfiedObject = JSON.stringify({})
const stringifiedDefaultColumnVisibility = JSON.stringify(
  defaultColumnVisibility,
)
const stringifiedDefaultPagination = JSON.stringify(defaultPagination)

type OffersListProps = { offersData: TOfferLookupResponse[] }
export function OffersTable({ offersData }: OffersListProps) {
  const data = React.useMemo(() => offersData, [offersData])

  const {
    value: rowSelection,
    set: setRowSelection,
    clear: clearRowSelectionStore,
  } = usePersistStorage<RowSelectionState>({
    key: 'selection',
    initialState: {},
    enableUrlStore: true,
  })
  // Clear store if the current value is default value
  React.useEffect(() => {
    if (JSON.stringify(rowSelection) === stringfiedObject) {
      clearRowSelectionStore()
    }
  }, [clearRowSelectionStore, rowSelection])

  const {
    value: columnVisibility,
    set: setColumnVisibility,
    clear: clearColumnVisibilityStore,
  } = usePersistStorage<VisibilityState>({
    key: 'offers-visibility',
    initialState: defaultColumnVisibility,
    storage: 'localStorage',
    enableUrlStore: true,
  })
  // Clear store if the current value is default value
  React.useEffect(() => {
    if (
      JSON.stringify(columnVisibility) === stringifiedDefaultColumnVisibility
    ) {
      clearColumnVisibilityStore()
    }
  }, [clearColumnVisibilityStore, columnVisibility])

  const {
    value: columnFilters,
    set: setColumnFilters,
    clear: clearColumnFiltersStore,
  } = usePersistStorage<ColumnFiltersState>({
    key: 'filter',
    initialState: [],
    enableUrlStore: true,
  })
  // Clear store if the current value is default value
  React.useEffect(() => {
    if (JSON.stringify(columnFilters) === stringfiedArray) {
      clearColumnFiltersStore()
    }
  }, [clearColumnFiltersStore, columnFilters])

  const [sorting, setSorting] = React.useState<SortingState>([])

  const {
    value: pagination,
    set: setPagination,
    clear: clearPaginationStore,
  } = usePersistStorage<PaginationState>({
    key: 'pagination',
    initialState: defaultPagination,
    enableUrlStore: true,
  })
  // Clear store if the current value is default value
  React.useEffect(() => {
    if (JSON.stringify(pagination) === stringifiedDefaultPagination) {
      clearPaginationStore()
    }
  }, [clearPaginationStore, pagination])

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility,
      columnFilters,
      sorting,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  return (
    <div className="relative flex flex-col gap-4 overflow-auto p-1">
      <div className="flex gap-2">
        <div className="ms-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
                  disabled={
                    JSON.stringify(columnVisibility) ===
                    stringifiedDefaultColumnVisibility
                  }
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
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={value =>
                          column.toggleVisibility(value)
                        }
                      >
                        {column.columnDef.header?.toString()}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
                        className="first-of-type:*:ms-1"
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
                            // If column is true AND into in default visibility object
                            columnVisibility[id] &&
                            id in defaultColumnVisibility
                          }
                          className="data-[is-visibled-by-user=true]:border-t-ring flex h-full items-center data-[is-visibled-by-user=true]:border-t-2 data-[is-visibled-by-user=true]:pt-0"
                        >
                          <div className="flex w-full items-center justify-between">
                            {/* Sort Button */}
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
                                    {
                                      <span
                                        data-has-sorted={
                                          getIsSorted() !== false
                                        }
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
                                    }
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

                            {/* Filter */}
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

      <div
        data-disable-pagination={
          !table.getCanPreviousPage() && !table.getCanNextPage()
        }
        className="group/toolbar flex items-center justify-between px-4 py-1"
      >
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 select-none lg:w-fit">
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

function Filter({ column }: { column: Column<TOfferLookupResponse, unknown> }) {
  const {
    columnDef,
    getFilterValue,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    setFilterValue,
  } = column
  const { filterVariant } = columnDef.meta ?? {}

  const columnFilterValue = getFilterValue()
  const facetedUniqueValues = getFacetedUniqueValues()

  const sortedUniqueValues = React.useMemo(() => {
    if (filterVariant === 'range') {
      return []
    }

    const slicedUniqueValues = Array.from(facetedUniqueValues.keys())
      .sort()
      .slice(0, 2000)

    return slicedUniqueValues
  }, [facetedUniqueValues, filterVariant])

  const isNone = sortedUniqueValues.length === 0
  const inNoneOrSingle = sortedUniqueValues.length <= 1

  return filterVariant === 'range' ? (
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
  ) : filterVariant === 'select' ? (
    <Dropdown
      filterVariant={filterVariant}
      isDisabled={inNoneOrSingle}
      renderItems={sortedUniqueValues.map((value, i) => {
        const val =
          value instanceof Date
            ? formatLocalDateTime(value, 'date', 'UTC')
            : value

        return (
          <DropdownMenuItem key={val + i} onClick={() => setFilterValue(val)}>
            {val}
          </DropdownMenuItem>
        )
      })}
    />
  ) : filterVariant === 'text' ? (
    <Dropdown
      filterVariant={filterVariant}
      icon={IconFilterSearch}
      isDisabled={isNone}
      renderItems={
        <Autocomplete column={column} sortedUniqueValues={sortedUniqueValues} />
      }
    />
  ) : null
}

type DropdownProps = {
  filterVariant: ColumnMeta<TProductLookupDataWithId, unknown>['filterVariant']
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

      <DropdownMenu open={open} onOpenChange={v => setOpen(v)}>
        <DropdownMenuTrigger className="-ms-2" />
        <DropdownMenuContent className="w-fit" align="end">
          {renderItems}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

type AutocompleteType = {
  column: Column<TOfferLookupResponse, unknown>
  sortedUniqueValues: unknown[]
}
function Autocomplete({ column, sortedUniqueValues }: AutocompleteType) {
  const [commandFilterValue, setCommandFilterValue] = React.useState<string>()
  const { getFilterValue, getFacetedUniqueValues, columnDef, setFilterValue } =
    column
  const columnFilterValue = getFilterValue()

  const count = getFacetedUniqueValues().size

  return (
    <Command
      value={commandFilterValue || ((columnFilterValue ?? '') as string)}
      onValueChange={value => setCommandFilterValue(value)}
    >
      <CommandInput
        placeholder={`Search in ${count} ${columnDef.meta?.header}`}
      />
      <CommandList className="w-3xs md:w-sm">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup onClick={() => setFilterValue(commandFilterValue)}>
          {sortedUniqueValues.map(value => (
            <CommandItem key={value as string} value={value as string}>
              {value as string}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

function DebouncedInput({
  value: externalValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string) => void
  debounce?: number
} & Omit<React.ComponentProps<'input'>, 'onChange' | 'value'>) {
  const [value, setValue] = React.useState(externalValue)
  const debouncedOnChange = useDebounce(onChange, debounce)

  const isInternalChange = React.useRef(false)

  React.useEffect(() => {
    if (!isInternalChange.current) {
      setValue(externalValue)
    }
    isInternalChange.current = false
  }, [externalValue])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    isInternalChange.current = true
    setValue(newValue)
    debouncedOnChange(newValue)
  }

  return <Input {...props} value={value} onChange={handleChange} />
}
