import { ApiRefType } from '.'

import { $createCodeNode, $isCodeNode, CodeNode } from '@lexical/code'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createQuoteNode, $isQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { IconCode, IconQuote } from '@tabler/icons-react'
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  ElementNode,
  LexicalNode,
  ParagraphNode,
  RangeSelection,
} from 'lexical'
import { useCallback, useImperativeHandle, useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type BlockElementsProps = { apiRef: ApiRefType }

export function BlockElements({ apiRef }: BlockElementsProps) {
  const [editor] = useLexicalComposerContext()
  const [isQuote, setIsQuote] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isInlineCode, setIsInlineCode] = useState(false)

  const activeBlockTypes = [
    isQuote && 'quote',
    (isCode || isInlineCode) && 'code',
  ].filter(Boolean) as string[]

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    const element = selection.anchor.getNode().getTopLevelElement()
    if (!element) return

    setIsQuote($isQuoteNode(element))
    setIsCode($isCodeNode(element))
    setIsInlineCode(selection.hasFormat('code'))
  }, [])

  useImperativeHandle(apiRef, () => ({ $updateToolbar }))

  const formatQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const element = selection.anchor.getNode().getTopLevelElement()
      if (!element) return

      $setBlocksType(selection, () =>
        $isQuoteNode(element) ? $createParagraphNode() : $createQuoteNode(),
      )
    })
  }, [editor])

  const formatCode = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const element = selection.anchor.getNode().getTopLevelElement()
      if (!element) return

      // Code block → paragraphs
      if ($isCodeNode(element)) {
        $convertToParagraphs(element).at(-1)?.selectEnd()
        return
      }

      // Toggle off inline code
      if (selection.hasFormat('code')) {
        selection.formatText('code')
        if (selection.isCollapsed()) selection.focus.getNode().selectEnd()
        return
      }

      const topLevels = $getSelectedTopLevelElements(selection)
      const isSingleLine =
        topLevels.length === 1 && !selection.getTextContent().includes('\n')

      // Single line selection → inline code
      if (!selection.isCollapsed() && isSingleLine) {
        selection.formatText('code')
        return
      }

      // Collapsed or multiline → code block
      $convertToCodeBlock(topLevels)?.selectEnd()
    })
  }, [editor])

  return (
    <ToggleGroup
      variant="outline"
      type="multiple"
      size="sm"
      value={activeBlockTypes}
    >
      <ToggleGroupItem value="quote" title="Quote" onClick={formatQuote}>
        <IconQuote />
      </ToggleGroupItem>
      <ToggleGroupItem value="code" title="Code" onClick={formatCode}>
        <IconCode />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

function $getSelectedTopLevelElements(
  selection: RangeSelection,
): ElementNode[] {
  const anchor = selection.anchor.getNode().getTopLevelElement()
  const focus = selection.focus.getNode().getTopLevelElement()

  if (!anchor || !focus) return []
  if (anchor === focus) return [anchor]

  const [start, end] = selection.isBackward()
    ? [focus, anchor]
    : [anchor, focus]
  if (start.getParent() !== end.getParent()) return [start]

  const elements: ElementNode[] = []
  for (
    let node: LexicalNode | null = start;
    node;
    node = node.getNextSibling()
  ) {
    if ($isElementNode(node)) elements.push(node)
    if (node === end) break
  }

  return elements
}

function $convertToCodeBlock(elements: ElementNode[]): CodeNode | null {
  if (!elements.length) return null

  const codeNode = $createCodeNode()
  const allText = elements.map(el => el.getTextContent()).join('\n')

  allText.split('\n').forEach((line, i) => {
    if (i > 0) codeNode.append($createLineBreakNode())
    if (line) codeNode.append($createTextNode(line))
  })

  elements[0].replace(codeNode)
  elements.slice(1).forEach(el => el.remove())

  return codeNode
}

function $convertToParagraphs(codeNode: CodeNode): ParagraphNode[] {
  const lines = codeNode.getTextContent().split('\n')
  const paragraphs = lines.map(line => {
    const p = $createParagraphNode()
    if (line) p.append($createTextNode(line))
    return p
  })

  if (!paragraphs.length) paragraphs.push($createParagraphNode())

  codeNode.replace(paragraphs[0])
  paragraphs.reduce((prev, curr) => (prev.insertAfter(curr), curr))

  return paragraphs
}
