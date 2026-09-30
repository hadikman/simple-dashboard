import { $isCodeNode } from '@lexical/code'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text'
import {
  $getRoot,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  type RangeSelection,
} from 'lexical'
import React from 'react'

import { $isAnchorNode } from '../nodes/anchor.node'

const TEXT_FORMATS = [
  'bold',
  'italic',
  'underline',
  'subscript',
  'superscript',
  'strikethrough',
  'highlight',
] as const

type SelectionInfo = {
  hasSelection: boolean
  selectedText: string
  tag: string
  anchor: string
  formats: string[]
  blockType: string
  charCount: number
  wordCount: number
}

const EMPTY_SELECTION: SelectionInfo = {
  hasSelection: false,
  selectedText: '',
  tag: '',
  anchor: '',
  formats: [],
  blockType: '',
  charCount: 0,
  wordCount: 0,
}

export function SelectionMonitorPlugin() {
  const [editor] = useLexicalComposerContext()
  const [info, setInfo] = React.useState<SelectionInfo>(EMPTY_SELECTION)

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        setInfo($getSelectionInfo())
      })
    })
  }, [editor])

  return (
    <div className="flex items-center gap-4 rounded-br-lg rounded-bl-lg border-t bg-gray-50 px-3.5 py-2 text-sm">
      <InfoItem
        label="Selected"
        value={info.hasSelection ? `"${info.selectedText}"` : ''}
      />
      <InfoItem label="Tag" value={info.tag} />
      <InfoItem label="Anchor" value={info.anchor} />
      <InfoItem
        label="Formats"
        value={info.formats.length > 0 ? info.formats.join(', ') : ''}
      />
      <InfoItem label="Block" value={info.blockType} />

      <div className="text-muted-foreground ml-auto flex gap-3">
        <span>
          {info.charCount} {info.charCount === 1 ? 'char' : 'chars'}
        </span>
        <span>
          {info.wordCount} {info.wordCount === 1 ? 'word' : 'words'}
        </span>
      </div>
    </div>
  )
}

function $getSelectionInfo(): SelectionInfo {
  const stats = $getEditorStats()
  const selection = $getSelection()

  if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes()
    if (nodes.length === 0) return { ...EMPTY_SELECTION, ...stats }

    const node = nodes[0]

    return {
      hasSelection: true,
      selectedText: '',
      tag: '',
      anchor: '',
      formats: [],
      blockType: node.getType(),
      ...stats,
    }
  }

  if ($isRangeSelection(selection)) {
    const anchorNode = selection.anchor.getNode()
    const element = anchorNode.getTopLevelElement()

    if (!element) return { ...EMPTY_SELECTION, ...stats }

    const parent = anchorNode.getParent()

    return {
      hasSelection: !selection.isCollapsed(),
      selectedText: selection.getTextContent().substring(0, 50),
      tag: $isHeadingNode(element) ? element.getTag() : '',
      anchor: $isAnchorNode(parent)
        ? parent.getAnchorId().replace('anchor-', '')
        : '',
      formats: $getActiveFormats(selection),
      blockType: parent?.getType() || 'paragraph',
      ...stats,
    }
  }

  return { ...EMPTY_SELECTION, ...stats }
}

function $getEditorStats(): { charCount: number; wordCount: number } {
  const root = $getRoot()
  const text = root.getTextContent()

  return {
    charCount: text.length,
    wordCount: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
  }
}

function $getActiveFormats(selection: RangeSelection): string[] {
  const formats: string[] = TEXT_FORMATS.filter(f => selection.hasFormat(f))
  const element = selection.anchor.getNode().getTopLevelElement()

  if ($isQuoteNode(element)) formats.push('quote')
  if ($isCodeNode(element)) formats.push('code')

  return formats
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}: </span>
      {value ? (
        <span className="font-semibold">{value}</span>
      ) : (
        <span className="text-muted-foreground">None</span>
      )}
    </div>
  )
}
