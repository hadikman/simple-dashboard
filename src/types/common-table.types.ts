import { RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // Allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    /**
     * Explicit minimum column width in pixels.
     *
     * IMPORTANT: When `meta.minSize` is provided, it COMPLETELY OVERRIDES:
     * - The column's default `minSize` from `defaultColumn`
     * - Any table-level minSize configuration
     *
     * This prop takes precedence via inline `minWidth: ${meta.minSize}px` style.
     * Use this when you need to prevent a column from shrinking below a specific
     * width, especially in compact tables with many visible columns.
     *
     * @remarks
     * - Does NOT affect the column's flexibility to grow (use `size` for that)
     * - If omitted, falls back to the column's internal `getSize()` value
     * - Useful for columns with critical content that must never be truncated
     * Useful for:
     * - Preventing to shrink th size in compacted table due all visibled columns
     */
    minSize?: number
    /**
     * Explicit column width in pixels.
     *
     * IMPORTANT: When `meta.size` is provided, it COMPLETELY OVERRIDES:
     * - The column's default `size` from `defaultColumn`
     * - Any sizing behavior from the table's internal column sizing logic
     *
     * This prop takes precedence via inline `width: ${meta.size}px` style.
     * Use this when you need exact, fixed-width columns that should not
     * participate in the table's automatic column sizing distribution.
     *
     * @remarks
     * - Conflicts with `meta.minSize` (both can be used together: size as fixed width, minSize as lower bound)
     * - If you want the table to automatically manage column widths, omit this prop
     * - Overrides the column's `getSize()` method result in the rendered output
     * Useful for:
     * - Preventing to grow th size in table with minimum visibled columns
     */
    size?: number
    filterVariant?: 'text' | 'range' | 'select'
    header?: string
  }
}
