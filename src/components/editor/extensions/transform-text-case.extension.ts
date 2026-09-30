import type { LexicalCommand } from 'lexical'

import { defineExtension } from '@lexical/extension'
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalEditor,
} from 'lexical'

export const TRANSFORM_TEXT_CASE_COMMAND: LexicalCommand<
  'uppercase' | 'lowercase' | 'capitalize'
> = createCommand('TRANSFORM_TEXT_CASE_COMMAND')

export const TransformTextCaseExtension = defineExtension({
  name: '@lexical/transform-text-case',
  register: editor => registerTransformTextCase(editor),
})

function transformCase(
  text: string,
  caseType: 'uppercase' | 'lowercase' | 'capitalize',
): string {
  switch (caseType) {
    case 'uppercase':
      return text.toUpperCase()
    case 'lowercase':
      return text.toLowerCase()
    case 'capitalize':
      return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
  }
}

function registerTransformTextCase(editor: LexicalEditor) {
  return editor.registerCommand(
    TRANSFORM_TEXT_CASE_COMMAND,
    caseType => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection) || selection.isCollapsed()) {
        return false
      }

      const selectedNodes = selection.getNodes()
      const anchor = selection.anchor
      const focus = selection.focus
      const isBackward = selection.isBackward()

      const startPoint = isBackward ? focus : anchor
      const endPoint = isBackward ? anchor : focus

      for (const node of selectedNodes) {
        if (!$isTextNode(node)) continue

        const text = node.getTextContent()
        let start = 0
        let end = text.length

        if (node.getKey() === startPoint.getNode().getKey()) {
          start = startPoint.offset
        }

        if (node.getKey() === endPoint.getNode().getKey()) {
          end = endPoint.offset
        }

        const before = text.slice(0, start)
        const selected = text.slice(start, end)
        const after = text.slice(end)

        const transformed = transformCase(selected, caseType)

        if (selected !== transformed) {
          const writable = node.getWritable()
          writable.__text = before + transformed + after
        }
      }

      return true
    },
    COMMAND_PRIORITY_EDITOR,
  )
}
