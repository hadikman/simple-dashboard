import { ApiRefType } from '.'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode'
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text'
import { $isTableSelection } from '@lexical/table'
import {
  $getNearestBlockElementAncestorOrThrow,
  $isBlockFullySelected,
} from '@lexical/utils'
import {
  IconClearAll,
  IconClearFormatting,
  IconHistory,
} from '@tabler/icons-react'
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  CAN_UNDO_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COMMAND_PRIORITY_LOW,
  ElementNode,
  NodeKey,
} from 'lexical'
import { useCallback, useEffect, useImperativeHandle, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

type ClearFormattingProps = { apiRef: ApiRefType }
export function Clear({ apiRef }: ClearFormattingProps) {
  const [editor] = useLexicalComposerContext()
  const [canClearFormat, setCanClearFormat] = useState(false)
  const [canClearContent, setCanClearContent] = useState(false)
  const [canUndo, setCanUndo] = useState(false)

  const canClearHistory = canUndo

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()

    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      setCanClearFormat(true)
    } else {
      setCanClearFormat(false)
    }

    const rootText = $getRoot().getTextContent()
    setCanClearContent(rootText.length > 0)
  }, [])

  useImperativeHandle(apiRef, () => ({
    $updateToolbar,
  }))

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      payload => {
        setCanUndo(payload)
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

  const clearHistory = useCallback(() => {
    editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
    setCanUndo(false)
  }, [editor])

  const clearFormatting = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const anchor = selection.anchor
        const focus = selection.focus
        const extractedNodes = selection.extract()

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          $clearBlockFormat(
            $getNearestBlockElementAncestorOrThrow(anchor.getNode()),
          )
          return
        }

        // Determine which blocks are fully selected before making any
        // changes, since the mutations below (such as replacing a
        // HeadingNode with a ParagraphNode) would detach nodes that the
        // selection's carets may refer to
        const postExtractSelection = $getSelection()
        let fullySelectedBlocks: null | Set<NodeKey> = null
        if ($isRangeSelection(postExtractSelection)) {
          fullySelectedBlocks = new Set()
          for (const node of extractedNodes) {
            if ($isTextNode(node)) {
              const block = $getNearestBlockElementAncestorOrThrow(node)
              if (
                !fullySelectedBlocks.has(block.getKey()) &&
                $isBlockFullySelected(block, postExtractSelection)
              ) {
                fullySelectedBlocks.add(block.getKey())
              }
            }
          }
        }

        extractedNodes.forEach(node => {
          if ($isTextNode(node)) {
            if (node.getStyle() !== '') {
              node.setStyle('')
            }
            if (node.getFormat() !== 0) {
              node.setFormat(0)
            }
            const nearestBlockElement =
              $getNearestBlockElementAncestorOrThrow(node)
            if (
              fullySelectedBlocks === null ||
              fullySelectedBlocks.has(nearestBlockElement.getKey())
            ) {
              $clearBlockFormat(nearestBlockElement)
            }
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true)
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat('')
          }
        })
      }
    })
  }, [editor])

  const clearAll = useCallback(() => {
    editor.update(() => {
      const root = $getRoot()
      const allText = root.getTextContent()

      if (allText.length === 0) return

      root.clear()

      const paragraph = $createParagraphNode()
      root.append(paragraph)
      paragraph.select()
    })
  }, [editor])

  return (
    <ButtonGroup>
      <Button
        variant="outline"
        size="icon"
        title="Clear History"
        disabled={!canClearHistory}
        onClick={clearHistory}
      >
        <IconHistory />
      </Button>
      <Button
        variant="outline"
        size="icon"
        title="Clear Content"
        disabled={!canClearContent}
        onClick={clearAll}
      >
        <IconClearAll />
      </Button>
      <Button
        variant="outline"
        size="icon"
        title="Clear Formatting"
        disabled={!canClearFormat}
        onClick={clearFormatting}
      >
        <IconClearFormatting />
      </Button>
    </ButtonGroup>
  )
}

function $clearBlockFormat(block: ElementNode): void {
  if (block.getFormat() !== 0) {
    block.setFormat('')
  }
  if (block.getIndent() !== 0) {
    block.setIndent(0)
  }
}
