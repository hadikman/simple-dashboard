'use client'

import { $isListItemNode, $isListNode, type ListNode } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  type LexicalNode,
  type NodeKey,
} from 'lexical'
import { useEffect } from 'react'

const NORMALIZE_ORDERED_LIST_VALUES_TAG = 'normalize-ordered-list-values'

export function ListNumberValueNormalizerPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, tags }) => {
      if (tags.has(NORMALIZE_ORDERED_LIST_VALUES_TAG)) {
        return
      }

      const changes: Array<[NodeKey, number]> = []

      editorState.read(() => {
        collectOrderedListValueFixes($getRoot(), changes)
      })

      if (changes.length === 0) {
        return
      }

      editor.update(
        () => {
          for (const [key, value] of changes) {
            const node = $getNodeByKey(key)
            if ($isListItemNode(node) && node.getValue() !== value) {
              node.setValue(value)
            }
          }
        },
        { tag: NORMALIZE_ORDERED_LIST_VALUES_TAG },
      )
    })
  }, [editor])

  return null
}

function collectOrderedListValueFixes(
  node: LexicalNode,
  changes: Array<[NodeKey, number]>,
) {
  if ($isListNode(node) && node.getListType() === 'number') {
    normalizeOrderedList(node, changes)
    return
  }

  if ($isElementNode(node)) {
    for (const child of node.getChildren()) {
      collectOrderedListValueFixes(child, changes)
    }
  }
}

function normalizeOrderedList(
  listNode: ListNode,
  changes: Array<[NodeKey, number]>,
) {
  let nextValue =
    typeof listNode.getStart === 'function' ? listNode.getStart() : 1

  for (const child of listNode.getChildren()) {
    if (!$isListItemNode(child)) continue

    if (child.getValue() !== nextValue) {
      changes.push([child.getKey(), nextValue])
    }

    nextValue++

    const children = child.getChildren()

    for (const grandChild of children) {
      if ($isListNode(grandChild)) {
        if (grandChild.getListType() === 'number') {
          normalizeOrderedList(grandChild, changes)
        } else {
          collectOrderedListValueFixes(grandChild, changes)
        }
      } else if ($isElementNode(grandChild)) {
        collectOrderedListValueFixes(grandChild, changes)
      }
    }
  }
}
