import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getTableColumnIndexFromTableCellNode,
  $getTableRowIndexFromTableCellNode,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  $isTableSelection,
  TableCellNode,
} from '@lexical/table'
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  COMMAND_PRIORITY_CRITICAL,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical'
import { useEffect } from 'react'

function $clearCellContent(cell: TableCellNode): void {
  cell.getChildren().forEach(child => child.remove())
  const paragraph = $createParagraphNode()
  paragraph.append($createTextNode(''))
  cell.append(paragraph)
}

function $isWholeRowsSelected(
  selectedCells: TableCellNode[],
  tableNode: ReturnType<typeof getTableInfo>['tableNode'],
): number[] | null {
  // Get all rows in the table
  const rows = tableNode.getChildren().filter($isTableRowNode)
  const selectedRowIndices = new Map<number, Set<TableCellNode>>()

  // Group selected cells by row index
  for (const cell of selectedCells) {
    const rowIndex = $getTableRowIndexFromTableCellNode(cell)
    if (!selectedRowIndices.has(rowIndex)) {
      selectedRowIndices.set(rowIndex, new Set())
    }
    selectedRowIndices.get(rowIndex)!.add(cell)
  }

  // Check if all cells in each selected row are selected
  const completeRowIndices: number[] = []

  for (const [rowIndex, cells] of selectedRowIndices) {
    const row = rows[rowIndex]
    if (!row) continue

    const totalCellsInRow = row.getChildren().filter($isTableCellNode).length

    if (cells.size === totalCellsInRow) {
      completeRowIndices.push(rowIndex)
    }
  }

  // Only return if ALL selected cells belong to complete rows
  // (no partial selections mixed in)
  const totalSelectedCells = selectedCells.length
  const cellsInCompleteRows = completeRowIndices.reduce((sum, rowIndex) => {
    const row = rows[rowIndex]
    if (!row) return sum
    return sum + row.getChildren().filter($isTableCellNode).length
  }, 0)

  if (
    completeRowIndices.length > 0 &&
    totalSelectedCells === cellsInCompleteRows
  ) {
    return completeRowIndices.sort((a, b) => a - b)
  }

  return null
}

function $isWholeColumnsSelected(
  selectedCells: TableCellNode[],
  tableNode: ReturnType<typeof getTableInfo>['tableNode'],
): number[] | null {
  const rows = tableNode.getChildren().filter($isTableRowNode)
  const totalRows = rows.length
  const selectedColumnIndices = new Map<number, Set<TableCellNode>>()

  // Group selected cells by column index
  for (const cell of selectedCells) {
    const colIndex = $getTableColumnIndexFromTableCellNode(cell)
    if (!selectedColumnIndices.has(colIndex)) {
      selectedColumnIndices.set(colIndex, new Set())
    }
    selectedColumnIndices.get(colIndex)!.add(cell)
  }

  // Check if all cells in each selected column are selected
  const completeColumnIndices: number[] = []

  for (const [colIndex, cells] of selectedColumnIndices) {
    if (cells.size === totalRows) {
      completeColumnIndices.push(colIndex)
    }
  }

  // Only return if ALL selected cells belong to complete columns
  const totalSelectedCells = selectedCells.length
  const cellsInCompleteColumns = completeColumnIndices.length * totalRows

  if (
    completeColumnIndices.length > 0 &&
    totalSelectedCells === cellsInCompleteColumns
  ) {
    return completeColumnIndices.sort((a, b) => a - b)
  }

  return null
}

function getTableInfo(selectedCells: TableCellNode[]) {
  const firstCell = selectedCells[0]
  const row = firstCell.getParent()

  if (!$isTableRowNode(row)) {
    throw new Error('Expected TableRowNode')
  }

  const tableNode = row.getParent()

  if (!$isTableNode(tableNode)) {
    throw new Error('Expected TableNode')
  }

  return { tableNode, firstCell }
}

function $deleteWholeRows(
  rowIndices: number[],
  tableNode: ReturnType<typeof getTableInfo>['tableNode'],
): void {
  const rows = tableNode.getChildren().filter($isTableRowNode)
  const totalRows = rows.length

  // If deleting all rows, remove the entire table
  if (rowIndices.length >= totalRows) {
    const paragraph = $createParagraphNode()
    paragraph.append($createTextNode(''))
    tableNode.insertAfter(paragraph)
    tableNode.remove()
    paragraph.selectStart()
    return
  }

  // Delete rows in reverse order to preserve indices
  const sortedIndices = [...rowIndices].sort((a, b) => b - a)

  for (const rowIndex of sortedIndices) {
    const row = rows[rowIndex]
    if (row) {
      row.remove()
    }
  }

  // Focus the nearest remaining cell
  const remainingRows = tableNode.getChildren().filter($isTableRowNode)
  if (remainingRows.length > 0) {
    const targetRowIndex = Math.min(rowIndices[0], remainingRows.length - 1)
    const targetRow = remainingRows[targetRowIndex]
    const firstCell = targetRow?.getChildren().find($isTableCellNode)
    if (firstCell) {
      firstCell.selectStart()
    }
  }
}

function $deleteWholeColumns(
  columnIndices: number[],
  tableNode: ReturnType<typeof getTableInfo>['tableNode'],
): void {
  const rows = tableNode.getChildren().filter($isTableRowNode)

  // Check if we're deleting all columns
  if (rows.length > 0) {
    const firstRow = rows[0]
    const totalColumns = firstRow.getChildren().filter($isTableCellNode).length

    if (columnIndices.length >= totalColumns) {
      const paragraph = $createParagraphNode()
      paragraph.append($createTextNode(''))
      tableNode.insertAfter(paragraph)
      tableNode.remove()
      paragraph.selectStart()
      return
    }
  }

  // Delete columns in reverse order to preserve indices
  const sortedIndices = [...columnIndices].sort((a, b) => b - a)

  for (const row of rows) {
    const cells = row.getChildren().filter($isTableCellNode)

    for (const colIndex of sortedIndices) {
      const cell = cells[colIndex]
      if (cell) {
        cell.remove()
      }
    }
  }

  // Focus the nearest remaining cell
  const remainingRows = tableNode.getChildren().filter($isTableRowNode)
  if (remainingRows.length > 0) {
    const firstRow = remainingRows[0]
    const cells = firstRow.getChildren().filter($isTableCellNode)
    const targetColIndex = Math.min(columnIndices[0], cells.length - 1)
    const targetCell = cells[targetColIndex]
    if (targetCell) {
      targetCell.selectStart()
    }
  }
}

function $handleTableCellDeletion(): boolean {
  const selection = $getSelection()

  if (!$isTableSelection(selection)) {
    return false
  }

  const selectedNodes = selection.getNodes()
  const selectedCells = selectedNodes.filter($isTableCellNode)

  if (selectedCells.length === 0) {
    return false
  }

  const { tableNode } = getTableInfo(selectedCells)

  // Check if whole rows are selected
  const wholeRows = $isWholeRowsSelected(selectedCells, tableNode)
  if (wholeRows !== null) {
    $deleteWholeRows(wholeRows, tableNode)
    return true
  }

  // Check if whole columns are selected
  const wholeColumns = $isWholeColumnsSelected(selectedCells, tableNode)
  if (wholeColumns !== null) {
    $deleteWholeColumns(wholeColumns, tableNode)
    return true
  }

  // Partial selection: only clear content
  for (const cell of selectedCells) {
    $clearCellContent(cell)
  }

  // Focus the first selected cell
  selectedCells[0].selectStart()

  return true
}

export function TableCellDeletePlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const removeBackspace = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      event => {
        const handled = editor.getEditorState().read(() => {
          const selection = $getSelection()
          return $isTableSelection(selection)
        })

        if (!handled) {
          return false
        }

        event.preventDefault()
        event.stopPropagation()

        editor.update(() => {
          $handleTableCellDeletion()
        })

        return true
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    const removeDelete = editor.registerCommand(
      KEY_DELETE_COMMAND,
      event => {
        const handled = editor.getEditorState().read(() => {
          const selection = $getSelection()
          return $isTableSelection(selection)
        })

        if (!handled) {
          return false
        }

        event.preventDefault()
        event.stopPropagation()

        editor.update(() => {
          $handleTableCellDeletion()
        })

        return true
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    return () => {
      removeBackspace()
      removeDelete()
    }
  }, [editor])

  return null
}
