'use client'

import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isListNode, $isListItemNode, ListItemNode } from '@lexical/list'
import { $getNearestNodeOfType } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  KEY_TAB_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from 'lexical'

export function CheckListRestrictionPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // 1. Prevent Tab/Shift+Tab inside check lists
    const unregisterTabCommand = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event: KeyboardEvent) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false

        const anchorNode = selection.anchor.getNode()
        const listItem = $getNearestNodeOfType(anchorNode, ListItemNode)

        if (!listItem) return false

        const parentList = listItem.getParent()
        if (!$isListNode(parentList)) return false

        if (parentList.getListType() === 'check') {
          event.preventDefault()
          return true
        }

        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    // 2. Unwrap any nested lists inside check list items
    const unregisterTransform = editor.registerNodeTransform(
      ListItemNode,
      node => {
        const parent = node.getParent()
        if (!$isListNode(parent)) return

        if (parent.getListType() !== 'check') return

        const children = node.getChildren()
        for (const child of children) {
          if ($isListNode(child)) {
            const nestedItems = child.getChildren()
            let insertAfter = node

            for (const nestedItem of nestedItems) {
              if ($isListItemNode(nestedItem)) {
                insertAfter.insertAfter(nestedItem)
                insertAfter = nestedItem
              }
            }

            child.remove()
          }
        }
      },
    )

    return () => {
      unregisterTabCommand()
      unregisterTransform()
    }
  }, [editor])

  return null
}
