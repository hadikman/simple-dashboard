import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'
import {
  $deleteTableColumnAtSelection,
  $getNodeTriplet,
  $getTableCellNodeFromLexicalNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableRowNode,
  $isTableSelection,
  $mergeCells,
  $removeTableRowAtIndex,
  $unmergeCell,
  getTableElement,
  getTableObserverFromTableElement,
  TableCellHeaderStates,
  TableCellNode,
  TableObserver,
  TableSelection,
} from '@lexical/table'
import { IconChevronDown } from '@tabler/icons-react'
import {
  $findMatchingParent,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_CRITICAL,
  ElementNode,
  getDOMSelection,
  mergeRegister,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { ColorPaletteComponent } from '@/components/editor/components/color-palette.component'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { $isCustomTableNode } from '../../nodes/table.node'

function $canUnmerge(): boolean {
  const selection = $getSelection()
  if (
    ($isRangeSelection(selection) && !selection.isCollapsed()) ||
    ($isTableSelection(selection) && !selection.anchor.is(selection.focus)) ||
    (!$isRangeSelection(selection) && !$isTableSelection(selection))
  ) {
    return false
  }
  const [cell] = $getNodeTriplet(selection.anchor)
  return cell.__colSpan > 1 || cell.__rowSpan > 1
}

function computeSelectionCount(selection: TableSelection): {
  columns: number
  rows: number
} {
  const selectionShape = selection.getShape()
  return {
    columns: selectionShape.toX - selectionShape.fromX + 1,
    rows: selectionShape.toY - selectionShape.fromY + 1,
  }
}

function $selectLastDescendant(node: ElementNode): void {
  const lastDescendant = node.getLastDescendant()
  if ($isTextNode(lastDescendant)) {
    lastDescendant.select()
  } else if ($isElementNode(lastDescendant)) {
    lastDescendant.selectEnd()
  } else if (lastDescendant !== null) {
    lastDescendant.selectNext()
  }
}

type TableCellActionMenuProps = Readonly<{
  tableCellNode: TableCellNode
  onClose: () => void
}>

type MenuType = {
  label: string
  onClick: () => void | undefined
  onPickerClick?: (value: string) => void
  isPicker?: boolean
  submenu?: MenuGroupsType[]
}
type MenuGroupsType = MenuType[] | false

function TableActionMenu({
  tableCellNode: _tableCellNode,
  onClose,
}: TableCellActionMenuProps) {
  const [editor] = useLexicalComposerContext()
  const [tableCellNode, updateTableCellNode] = useState(_tableCellNode)
  const [selectionCounts, updateSelectionCounts] = useState({
    columns: 1,
    rows: 1,
  })
  const [canMergeCells, setCanMergeCells] = useState(false)
  const [canUnmergeCell, setCanUnmergeCell] = useState(false)

  useEffect(() => {
    return editor.registerMutationListener(TableCellNode, nodeMutations => {
      const nodeUpdated =
        nodeMutations.get(tableCellNode.getKey()) === 'updated'

      if (nodeUpdated) {
        editor.getEditorState().read(() => {
          updateTableCellNode(tableCellNode.getLatest())
        })
      }
    })
  }, [editor, tableCellNode])

  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()

      if ($isTableSelection(selection)) {
        const selectionShape = selection.getShape()

        updateSelectionCounts({
          columns: selectionShape.toX - selectionShape.fromX + 1,
          rows: selectionShape.toY - selectionShape.fromY + 1,
        })
      }
    })
  }, [editor])

  const clearTableSelection = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
        const tableElement = getTableElement(
          tableNode,
          editor.getElementByKey(tableNode.getKey()),
        )

        if (!tableElement) {
          throw new Error(
            'TableActionMenu: Expected to find tableElement in DOM',
          )
        }

        const tableObserver = getTableObserverFromTableElement(tableElement)
        if (tableObserver !== null) {
          tableObserver.$clearHighlight()
        }

        tableNode.markDirty()
      }

      try {
        if (tableCellNode.isAttached()) {
          updateTableCellNode(tableCellNode.getLatest())
        }
      } catch (e) {
        // Node might have been removed during the operation
      }

      $setSelection(null)
    })
  }, [editor, tableCellNode])

  const insertTableRowAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        $insertTableRowAtSelection(shouldInsertAfter)

        onClose()
      })
    },
    [editor, onClose],
  )

  const insertTableColumnAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        $insertTableColumnAtSelection(shouldInsertAfter)
        onClose()
      })
    },
    [editor, onClose],
  )

  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      // Merge cells
      if ($isTableSelection(selection)) {
        const currentSelectionCounts = computeSelectionCount(selection)
        updateSelectionCounts(computeSelectionCount(selection))
        const isCollapsedTableSelection = selection.anchor.is(selection.focus)
        setCanMergeCells(
          !isCollapsedTableSelection &&
            (currentSelectionCounts.columns > 1 ||
              currentSelectionCounts.rows > 1),
        )
      }
      // Unmerge cell
      setCanUnmergeCell($canUnmerge())
    })
  }, [editor])

  const mergeTableCellsAtSelection = () => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isTableSelection(selection)) {
        return
      }

      const nodes = selection.getNodes()
      const tableCells = nodes.filter($isTableCellNode)
      const targetCell = $mergeCells(tableCells)

      if (targetCell) {
        $selectLastDescendant(targetCell)
        onClose()
      }
    })
  }

  const unmergeTableCellsAtSelection = () => {
    editor.update(() => {
      $unmergeCell()
    })
    // BUG it produces error
    // clearTableSelection()
  }

  const handleCellBackgroundColor = useCallback(
    (value: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
          const [cell] = $getNodeTriplet(selection.anchor)
          if ($isTableCellNode(cell)) {
            cell.setBackgroundColor(value)
          }

          if ($isTableSelection(selection)) {
            const nodes = selection.getNodes()

            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i]
              if ($isTableCellNode(node)) {
                node.setBackgroundColor(value)
              }
            }
          }
        }
      })
    },
    [editor],
  )

  const deleteTableColumnAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableColumnAtSelection()
      clearTableSelection()
      onClose()
    })
  }, [clearTableSelection, editor, onClose])

  const deleteTableRowAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode)

      $removeTableRowAtIndex(tableNode, tableRowIndex)

      clearTableSelection()
      onClose()
    })
  }, [editor, tableCellNode, clearTableSelection, onClose])

  const deleteTableAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
      tableNode.remove()

      clearTableSelection()
      onClose()
    })
  }, [editor, tableCellNode, clearTableSelection, onClose])

  const toggleRowStriping = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
        if (tableNode) {
          tableNode.setRowStriping(!tableNode.getRowStriping())
        }
      }
      // clearTableSelection()
      onClose()
    })
  }, [editor, tableCellNode, onClose])

  const toggleFullWidth = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const anchorNode = selection.anchor.getNode()
      const tableNode = $findMatchingParent(anchorNode, $isCustomTableNode)

      if (tableNode) {
        tableNode.setFullWidth(!tableNode.getFullWidth())
      }

      onClose()
    })
  }, [editor, onClose])

  const formatVerticalAlign = (value: 'top' | 'middle' | 'bottom') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const [cell] = $getNodeTriplet(selection.anchor)
        if ($isTableCellNode(cell)) {
          cell.setVerticalAlign(value)
        }

        if ($isTableSelection(selection)) {
          const nodes = selection.getNodes()

          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if ($isTableCellNode(node)) {
              node.setVerticalAlign(value)
            }
          }
        }
      }
    })
  }

  const toggleFirstRowFreeze = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
        if (tableNode) {
          tableNode.setFrozenRows(tableNode.getFrozenRows() === 0 ? 1 : 0)
        }
      }
      // clearTableSelection()
      onClose()
    })
  }, [editor, tableCellNode, onClose])

  const toggleFirstColumnFreeze = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
        if (tableNode) {
          tableNode.setFrozenColumns(tableNode.getFrozenColumns() === 0 ? 1 : 0)
        }
      }
      // clearTableSelection()
      onClose()
    })
  }, [editor, tableCellNode, onClose])

  const toggleTableRowIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)

      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode)

      const tableRows = tableNode.getChildren()

      if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
        throw new Error('Expected table cell to be inside of table row.')
      }

      const tableRow = tableRows[tableRowIndex]

      if (!$isTableRowNode(tableRow)) {
        throw new Error('Expected table row')
      }

      tableRow.getChildren().forEach(tableCell => {
        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell')
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.ROW)
      })

      onClose()
    })
  }, [editor, tableCellNode, onClose])

  const toggleTableColumnIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)

      const tableColumnIndex =
        $getTableColumnIndexFromTableCellNode(tableCellNode)

      const tableRows = tableNode.getChildren()

      for (let r = 0; r < tableRows.length; r++) {
        const tableRow = tableRows[r]

        if (!$isTableRowNode(tableRow)) {
          throw new Error('Expected table row')
        }

        const tableCells = tableRow.getChildren()

        if (tableColumnIndex >= tableCells.length || tableColumnIndex < 0) {
          throw new Error('Expected table cell to be inside of table row.')
        }

        const tableCell = tableCells[tableColumnIndex]

        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell')
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.COLUMN)
      }

      onClose()
    })
  }, [editor, tableCellNode, onClose])

  const menuItems: MenuGroupsType[] = [
    [
      {
        label: `Insert ${selectionCounts.rows === 1 ? 'Row' : `${selectionCounts.rows} Rows`} Above`,
        onClick: () => insertTableRowAtSelection(false),
      },
      {
        label: `Insert ${selectionCounts.rows === 1 ? 'Row' : `${selectionCounts.rows} Rows`} Below`,
        onClick: () => insertTableRowAtSelection(true),
      },
    ],
    [
      {
        label: `Insert ${selectionCounts.columns === 1 ? 'Column' : `${selectionCounts.columns} Columns`} Left`,
        onClick: () => insertTableColumnAtSelection(false),
      },
      {
        label: `Insert ${selectionCounts.columns === 1 ? 'Column' : `${selectionCounts.columns} Columns`} Right`,
        onClick: () => insertTableColumnAtSelection(true),
      },
    ],
    canMergeCells && [
      {
        label: 'Merge Cells',
        onClick: () => mergeTableCellsAtSelection(),
      },
    ],
    canUnmergeCell && [
      {
        label: 'Unmerge Cells',
        onClick: () => unmergeTableCellsAtSelection(),
      },
    ],
    [
      {
        label: 'Background Color',
        onClick: () => undefined,
        onPickerClick: color => handleCellBackgroundColor(color),
        isPicker: true,
      },
      {
        label: 'Toggle Row Striping',
        onClick: () => toggleRowStriping(),
      },
      {
        label: 'Toggle Full Width',
        onClick: () => toggleFullWidth(),
      },
      {
        label: 'Vertical Align',
        onClick: () => undefined,
        submenu: [
          [
            {
              label: 'Top Align',
              onClick: () => formatVerticalAlign('top'),
            },
            {
              label: 'Middle Align',
              onClick: () => formatVerticalAlign('middle'),
            },
            {
              label: 'Bottom Align',
              onClick: () => formatVerticalAlign('bottom'),
            },
          ],
        ],
      },
      {
        label: 'Toggle First Row Freeze',
        onClick: () => toggleFirstRowFreeze(),
      },
      {
        label: 'Toggle First Column Freeze',
        onClick: () => toggleFirstColumnFreeze(),
      },
    ],
    [
      {
        label: `${(tableCellNode.__headerState & TableCellHeaderStates.ROW) === TableCellHeaderStates.ROW ? 'Remove' : 'Add'} Row Header`,
        onClick: () => toggleTableRowIsHeader(),
      },
      {
        label: `${(tableCellNode.__headerState & TableCellHeaderStates.COLUMN) === TableCellHeaderStates.COLUMN ? 'Remove' : 'Add'} Column Header`,
        onClick: () => toggleTableColumnIsHeader(),
      },
    ],
    [
      {
        label: 'Delete Column',
        onClick: () => deleteTableColumnAtSelection(),
      },
      {
        label: 'Delete Row',
        onClick: () => deleteTableRowAtSelection(),
      },
      {
        label: 'Delete Table',
        onClick: () => deleteTableAtSelection(),
      },
    ],
  ]

  return menuItems
    .filter(item => !!item)
    .map((items, idx) => (
      <Fragment key={idx}>
        {idx > 0 && <DropdownMenuSeparator />}
        <DropdownMenuGroup>
          {items.map((item, i) =>
            item.submenu?.length ? (
              <DropdownSubmenu key={i} data={item} />
            ) : item.isPicker ? (
              <DropdownSubItemPicker
                key={i}
                label={item.label}
                onSelectColor={item.onPickerClick!}
              />
            ) : (
              <DropdownMenuItem key={i} onClick={item.onClick}>
                {item.label}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuGroup>
      </Fragment>
    ))
}

type DropdownSubItemPickerType = {
  label: string
  onSelectColor: (color: string) => void
}
function DropdownSubItemPicker({
  label,
  onSelectColor,
}: DropdownSubItemPickerType) {
  const [color, setColor] = useState('')

  function handleColorSelection(color: string) {
    setColor(color)
    onSelectColor(color)
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{label}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem asChild>
            <ColorPaletteComponent
              selectedColor={color}
              onSelect={color => handleColorSelection(color)}
              onClear={() => {
                setColor('')
                onSelectColor('')
              }}
            />
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

function DropdownSubmenu({ data }: { data: MenuType }) {
  return (
    data.submenu && (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{data.label}</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {data.submenu
              .filter(item => !!item)
              .map((items, idx) => (
                <Fragment key={idx}>
                  {idx > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuGroup>
                    {items.map((item, i) =>
                      item.submenu?.length ? (
                        <DropdownSubmenu key={i} data={item} />
                      ) : item.isPicker ? (
                        <DropdownSubItemPicker
                          key={i}
                          label={item.label}
                          onSelectColor={item.onPickerClick!}
                        />
                      ) : (
                        <DropdownMenuItem key={i} onClick={item.onClick}>
                          {item.label}
                        </DropdownMenuItem>
                      ),
                    )}
                  </DropdownMenuGroup>
                </Fragment>
              ))}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    )
  )
}

function TableCellActionMenuContainer() {
  const [editor] = useLexicalComposerContext()

  const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(
    null,
  )
  const menuButtonRef = useRef<HTMLDivElement | null>(null)

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const checkTableCellOverflow = useCallback(
    (tableCellParentNodeDOM: HTMLElement): boolean => {
      const scrollableContainer = tableCellParentNodeDOM.closest(
        '.tableScrollableWrapper',
      )
      if (scrollableContainer) {
        const containerRect = (
          scrollableContainer as HTMLElement
        ).getBoundingClientRect()
        const cellRect = tableCellParentNodeDOM.getBoundingClientRect()

        // Calculate where the action button would be positioned (5px from right edge of cell)
        // Also account for the button width and table cell padding (8px)
        const actionButtonRight = cellRect.right - 5
        const actionButtonLeft = actionButtonRight - 28 // 20px width + 8px padding

        // Only hide if the action button would overflow the container
        if (
          actionButtonRight > containerRect.right ||
          actionButtonLeft < containerRect.left
        ) {
          return true
        }
      }
      return false
    },
    [],
  )

  const $moveMenu = useCallback(() => {
    const menu = menuButtonRef.current
    const selection = $getSelection()
    const nativeSelection = getDOMSelection(editor._window)
    const activeElement = document.activeElement
    function disable() {
      if (menu) {
        menu.classList.remove('table-cell-action-button-container--active')
        menu.classList.add('table-cell-action-button-container--inactive')
      }
      setTableMenuCellNode(null)
    }

    if (selection == null || menu == null) {
      return disable()
    }

    const rootElement = editor.getRootElement()
    let tableObserver: TableObserver | null = null
    let tableCellParentNodeDOM: HTMLElement | null = null

    if (
      $isRangeSelection(selection) &&
      rootElement !== null &&
      nativeSelection !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
        selection.anchor.getNode(),
      )

      if (tableCellNodeFromSelection == null) {
        return disable()
      }

      tableCellParentNodeDOM = editor.getElementByKey(
        tableCellNodeFromSelection.getKey(),
      )

      if (
        tableCellParentNodeDOM == null ||
        !tableCellNodeFromSelection.isAttached()
      ) {
        return disable()
      }

      if (checkTableCellOverflow(tableCellParentNodeDOM)) {
        return disable()
      }

      const tableNode = $getTableNodeFromLexicalNodeOrThrow(
        tableCellNodeFromSelection,
      )
      const tableElement = getTableElement(
        tableNode,
        editor.getElementByKey(tableNode.getKey()),
      )

      if (tableElement === null) {
        throw new Error('TableActionMenu: Expected to find tableElement in DOM')
      }

      tableObserver = getTableObserverFromTableElement(tableElement)
      setTableMenuCellNode(tableCellNodeFromSelection)
    } else if ($isTableSelection(selection)) {
      const anchorNode = $getTableCellNodeFromLexicalNode(
        selection.anchor.getNode(),
      )
      if (!$isTableCellNode(anchorNode)) {
        throw new Error('TableSelection anchorNode must be a TableCellNode')
      }
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(anchorNode)
      const tableElement = getTableElement(
        tableNode,
        editor.getElementByKey(tableNode.getKey()),
      )
      if (tableElement === null) {
        throw new Error('TableActionMenu: Expected to find tableElement in DOM')
      }
      tableObserver = getTableObserverFromTableElement(tableElement)
      tableCellParentNodeDOM = editor.getElementByKey(anchorNode.getKey())

      if (tableCellParentNodeDOM === null) {
        return disable()
      }

      if (checkTableCellOverflow(tableCellParentNodeDOM)) {
        return disable()
      }
    } else if (!activeElement) {
      return disable()
    }

    if (tableObserver === null || tableCellParentNodeDOM === null) {
      return disable()
    }
    const enabled = !tableObserver || !tableObserver.isSelecting
    menu.classList.toggle('table-cell-action-button-container--active', enabled)
    menu.classList.toggle(
      'table-cell-action-button-container--inactive',
      !enabled,
    )
    if (enabled) {
      const tableCellRect = tableCellParentNodeDOM.getBoundingClientRect()
      const anchorRect = document.body.getBoundingClientRect()
      const top = tableCellRect.top - anchorRect.top + 2
      const left = tableCellRect.right - anchorRect.left - 32
      menu.style.transform = `translate(${left}px, ${top}px)`
    }
  }, [editor, checkTableCellOverflow])

  useEffect(() => {
    // We call the $moveMenu callback every time the selection changes,
    // once up front, and once after each pointerUp
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined
    const callback = () => {
      timeoutId = undefined
      editor.getEditorState().read($moveMenu, { editor })
    }
    const delayedCallback = () => {
      if (timeoutId === undefined) {
        timeoutId = setTimeout(callback, 0)
      }
      return false
    }
    return mergeRegister(
      editor.registerUpdateListener(delayedCallback),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        delayedCallback,
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerRootListener(rootElement => {
        if (rootElement) {
          rootElement.addEventListener('pointerup', delayedCallback)
          delayedCallback()
          return () =>
            rootElement.removeEventListener('pointerup', delayedCallback)
        }
      }),
      () => clearTimeout(timeoutId),
    )
  })

  const prevTableCellDOM = useRef(tableCellNode)

  useEffect(() => {
    if (prevTableCellDOM.current !== tableCellNode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMenuOpen(false)
    }

    prevTableCellDOM.current = tableCellNode
  }, [prevTableCellDOM, tableCellNode])

  useEffect(() => {
    let resizeRAFId: number | undefined
    let scrollRAFId: number | undefined

    const hideMenu = () => {
      const menu = menuButtonRef.current
      if (menu) {
        menu.classList.remove('table-cell-action-button-container--active')
        menu.classList.add('table-cell-action-button-container--inactive')
      }
    }

    const handleResize = () => {
      if (resizeRAFId) {
        cancelAnimationFrame(resizeRAFId)
      }
      resizeRAFId = requestAnimationFrame(() => {
        setTimeout(hideMenu, 100)
      })
    }

    const handleScroll = () => {
      if (scrollRAFId) {
        cancelAnimationFrame(scrollRAFId)
      }
      scrollRAFId = requestAnimationFrame(hideMenu)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    document.addEventListener('scroll', handleScroll, {
      capture: true,
      passive: true,
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('scroll', handleScroll, { capture: true })
      if (resizeRAFId) cancelAnimationFrame(resizeRAFId)
      if (scrollRAFId) cancelAnimationFrame(scrollRAFId)
    }
  }, [])

  return (
    <div ref={menuButtonRef} className="table-cell-action-button-container">
      {tableCellNode !== null && (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="table-cell-action-button"
            >
              <IconChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right">
            <TableActionMenu
              onClose={() => setIsMenuOpen(false)}
              tableCellNode={tableCellNode}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export default function TableActionMenuPlugin() {
  const isEditable = useLexicalEditable()

  return createPortal(
    isEditable ? <TableCellActionMenuContainer /> : null,
    document.body,
  )
}
