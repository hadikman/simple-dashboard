'use client'

import { $isCodeNode } from '@lexical/code'
import { $isLinkNode } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  LexicalNode,
  TextNode,
} from 'lexical'
import React from 'react'
import { $isAnchorNode } from '../nodes/anchor.node'

export function TransformPlugin() {
  const [editor] = useLexicalComposerContext()

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const transformTextNode = (textNode: TextNode) => {
      // Debounce rapid typing
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        // CRITICAL FIX: Check if node still exists before updating
        editor.update(() => {
          // Verify the node is still attached to the editor
          if (textNode.isAttached()) {
            performTransform(textNode)
          }
        })
      }, 100)
    }

    return editor.registerNodeTransform(TextNode, transformTextNode)
  }, [editor])

  return null
}

function performTransform(textNode: TextNode) {
  if (!textNode.isAttached()) return

  const element = textNode.getTopLevelElement()

  if (!element) return

  // Skip code blocks and special nodes
  if ($isCodeNode(element)) return
  if (textNode.isSegmented() || textNode.isToken()) return

  // Skip if inside anchor/link nodes
  let parent = textNode.getParent()
  while (parent) {
    if ($isAnchorNode(parent) || $isLinkNode(parent)) return
    parent = parent.getParent()
  }

  const text = textNode.getTextContent()
  if (!text) return

  let modifiedText = text
  let hasChanges = false

  // Method 1: Handle first character
  if (text.length > 0 && text[0] === text[0].toLowerCase()) {
    const previousSibling = textNode.getPreviousSibling()
    let shouldCapitalize = false

    if (!previousSibling) {
      // Start of paragraph - always capitalize
      shouldCapitalize = true
    } else if ($isTextNode(previousSibling)) {
      const prevText = previousSibling.getTextContent()
      // Capitalize if previous text ends with sentence punctuation
      if (/[.!?]\s*$/.test(prevText)) {
        shouldCapitalize = true
      }
    } else if ($isElementNode(previousSibling)) {
      // Check if previous element node's last text child ends with punctuation
      const lastTextChild = getLastTextNode(previousSibling)
      if (lastTextChild && /[.!?]\s*$/.test(lastTextChild.getTextContent())) {
        shouldCapitalize = true
      }
    }

    if (shouldCapitalize) {
      modifiedText = modifiedText[0].toUpperCase() + modifiedText.slice(1)
      hasChanges = true
    }
  }

  // Method 2: Handle all sentence boundaries within the text node
  const sentenceBoundaryRegex = /([.!?])\s+([a-z])/g

  modifiedText = modifiedText.replace(
    sentenceBoundaryRegex,
    (match, punctuation, letter) => {
      hasChanges = true
      return `${punctuation} ${letter.toUpperCase()}`
    },
  )

  // Method 3: Handle new lines and paragraph breaks
  const newlinePattern = /\n\s*([a-z])/g
  modifiedText = modifiedText.replace(newlinePattern, (match, letter) => {
    hasChanges = true
    return `\n${letter.toUpperCase()}`
  })

  // Apply the changes
  if (hasChanges && modifiedText !== text) {
    // Verify node is still attached before modifying
    if (!textNode.isAttached()) return

    // Preserve selection if possible
    const selection = $getSelection()
    const wasCollapsed = $isRangeSelection(selection) && selection.isCollapsed()

    textNode.setTextContent(modifiedText)

    // If the cursor was at the end, keep it at the end
    if (wasCollapsed && selection && $isRangeSelection(selection)) {
      const anchor = selection.anchor
      if (anchor.key === textNode.getKey() && anchor.offset === text.length) {
        textNode.selectEnd()
      }
    }
  }
}

// Helper function to get the last text node within an element
function getLastTextNode(startNode: LexicalNode): TextNode | null {
  const node: LexicalNode | null = startNode

  // First, if it's a text node, return it
  if ($isTextNode(node)) {
    return node
  }

  // Use a stack to traverse nodes iteratively
  const stack: LexicalNode[] = []

  if ($isElementNode(node)) {
    // Push all children in reverse order to process from the end
    const children = node.getChildren()
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i])
    }
  }

  while (stack.length > 0) {
    const currentNode = stack.pop()

    if (!currentNode) continue

    if ($isTextNode(currentNode)) {
      return currentNode
    }

    if ($isElementNode(currentNode)) {
      const children = currentNode.getChildren()
      // Push in reverse order to maintain depth-first from the end
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i])
      }
    }
  }

  return null
}
