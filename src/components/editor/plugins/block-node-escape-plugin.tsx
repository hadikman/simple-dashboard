// plugins/block-node-escape-plugin.tsx
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isTableCellNode, $isTableNode, $isTableRowNode } from '@lexical/table'
import { $findMatchingParent } from '@lexical/utils'
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  LexicalNode,
  mergeRegister,
} from 'lexical'
import { useEffect } from 'react'

import { $isImageNode } from '../nodes/image/image.node'
import { $isCustomTableNode } from '../nodes/table.node'

// ─── Helpers ────────────────────────────────────────────────────────────

// STANDBY If need add other custom nodes too like isCollapsibleContentNode
function $isBlockNode(node: LexicalNode | null | undefined): boolean {
  return $isTableNode(node) || $isCustomTableNode(node) || $isImageNode(node)
}

/**
 * Find the top-level block node (table or image wrapper paragraph)
 * relative to the root.
 */
function $findTopLevelBlockNode(node: LexicalNode): LexicalNode | null {
  const root = $getRoot()

  // For node selections (image click)
  if ($isImageNode(node)) {
    const parent = node.getParent()
    if (parent && parent.getParent()?.getKey() === root.getKey()) {
      return parent
    }
    return node
  }

  // For table nodes
  const tableNode = $findMatchingParent(
    node,
    n => $isTableNode(n) || $isCustomTableNode(n),
  )
  if (!tableNode) return null

  // Walk up to find the top-level parent under root
  let topLevel: LexicalNode = tableNode
  let parent = topLevel.getParent()
  while (parent && parent.getKey() !== root.getKey()) {
    topLevel = parent
    parent = topLevel.getParent()
  }

  return topLevel
}

/**
 * Check if the caret is in the last cell of a table's last row.
 */
function $isAtTableEnd(node: LexicalNode): boolean {
  const tableCell = $findMatchingParent(node, $isTableCellNode)
  if (!tableCell) return false

  const tableRow = $findMatchingParent(tableCell, $isTableRowNode)
  if (!tableRow) return false

  const tableNode = $findMatchingParent(
    tableRow,
    n => $isTableNode(n) || $isCustomTableNode(n),
  )
  if (!tableNode) return false

  const rows = tableNode.getChildren().filter($isTableRowNode)
  const lastRow = rows[rows.length - 1]
  if (tableRow.getKey() !== lastRow?.getKey()) return false

  const cells = lastRow.getChildren().filter($isTableCellNode)
  const lastCell = cells[cells.length - 1]
  return tableCell.getKey() === lastCell?.getKey()
}

/**
 * Check if the caret is in the first cell of a table's first row.
 */
function $isAtTableStart(node: LexicalNode): boolean {
  const tableCell = $findMatchingParent(node, $isTableCellNode)
  if (!tableCell) return false

  const tableRow = $findMatchingParent(tableCell, $isTableRowNode)
  if (!tableRow) return false

  const tableNode = $findMatchingParent(
    tableRow,
    n => $isTableNode(n) || $isCustomTableNode(n),
  )
  if (!tableNode) return false

  const rows = tableNode.getChildren().filter($isTableRowNode)
  const firstRow = rows[0]
  if (tableRow.getKey() !== firstRow?.getKey()) return false

  const cells = firstRow.getChildren().filter($isTableCellNode)
  const firstCell = cells[0]
  return tableCell.getKey() === firstCell?.getKey()
}

/**
 * Determine if the caret is at the edge of a block node
 * and which direction it's trying to escape.
 */
function $getEscapeInfo(direction: 'up' | 'down'): {
  topLevelNode: LexicalNode
  shouldEscape: boolean
} | null {
  const selection = $getSelection()

  // Handle node selection (selected image)
  if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes()
    if (nodes.length !== 1) return null

    const node = nodes[0]
    if (!$isBlockNode(node)) return null // <-- USE IT HERE

    // Don't escape if image has caption and pressing down
    if (direction === 'down' && $isImageNode(node) && node.__showCaption) {
      return null
    }

    const topLevel = $findTopLevelBlockNode(node)
    if (!topLevel) return null

    return { topLevelNode: topLevel, shouldEscape: true }
  }

  // Handle range selection (caret inside table)
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null

  const anchorNode = selection.anchor.getNode()

  // Walk up to find any block node ancestor
  const blockNode = $findMatchingParent(anchorNode, $isBlockNode) // <-- USE IT HERE

  if (!blockNode) return null

  // Table-specific edge detection
  if ($isTableNode(blockNode) || $isCustomTableNode(blockNode)) {
    const isAtEdge =
      direction === 'down'
        ? $isAtTableEnd(anchorNode)
        : $isAtTableStart(anchorNode)

    if (!isAtEdge) return null
  }

  const topLevel = $findTopLevelBlockNode(anchorNode)
  if (!topLevel) return null

  return { topLevelNode: topLevel, shouldEscape: true }
}

/**
 * Check if the block node is at the edge of the document
 * (no sibling in the escape direction).
 */
function $hasNoSibling(node: LexicalNode, direction: 'up' | 'down'): boolean {
  const sibling =
    direction === 'down' ? node.getNextSibling() : node.getPreviousSibling()
  return sibling === null
}

/**
 * Insert a paragraph and move cursor to it.
 */
function $insertParagraphAndSelect(
  node: LexicalNode,
  direction: 'up' | 'down',
): void {
  const paragraph = $createParagraphNode()

  if (direction === 'down') {
    node.insertAfter(paragraph)
  } else {
    node.insertBefore(paragraph)
  }

  paragraph.selectStart()
}

/**
 * Try to move to existing sibling.
 */
function $moveToSibling(node: LexicalNode, direction: 'up' | 'down'): boolean {
  const sibling =
    direction === 'down' ? node.getNextSibling() : node.getPreviousSibling()

  if (sibling && $isElementNode(sibling)) {
    if (direction === 'down') {
      sibling.selectStart()
    } else {
      sibling.selectEnd()
    }
    return true
  }

  return false
}

// ─── Plugin ─────────────────────────────────────────────────────────────

export function BlockNodeEscapePlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent | null,
      direction: 'up' | 'down',
    ): boolean {
      // Don't handle modified keys
      if (event?.shiftKey || event?.ctrlKey || event?.metaKey) {
        return false
      }

      const info = editor.getEditorState().read(() => $getEscapeInfo(direction))
      if (!info) return false

      const { topLevelNode } = info

      event?.preventDefault()

      editor.update(() => {
        const latestNode = topLevelNode.getLatest()

        if ($hasNoSibling(latestNode, direction)) {
          // No sibling: insert a new paragraph
          $insertParagraphAndSelect(latestNode, direction)
        } else {
          // Has sibling: move to it
          $moveToSibling(latestNode, direction)
        }
      })

      return true
    }
    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        event => handleEscape(event, 'down'),
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        event => handleEscape(event, 'up'),
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        event => {
          if (event?.shiftKey || event?.ctrlKey || event?.metaKey) {
            return false
          }

          const selection = $getSelection()
          if (!$isNodeSelection(selection)) return false

          const info = editor
            .getEditorState()
            .read(() => $getEscapeInfo('down'))
          if (!info) return false

          event?.preventDefault()

          editor.update(() => {
            const latestNode = info.topLevelNode.getLatest()
            $insertParagraphAndSelect(latestNode, 'down')
          })

          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])

  return null
}
