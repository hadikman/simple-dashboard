import { ToolApi } from '.'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  IconBold,
  IconItalic,
  IconLetterCaseLower,
  IconLetterCaseToggle,
  IconLetterCaseUpper,
  IconStrikethrough,
  IconSubscript,
  IconSuperscript,
  IconUnderline,
} from '@tabler/icons-react'
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'
import { useCallback, useImperativeHandle, useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { TRANSFORM_TEXT_CASE_COMMAND } from '../../extensions/transform-text-case.extension'

type TextFormattingProps = {
  apiRef: React.RefObject<ToolApi | null>
}

export function TextFormatting({ apiRef }: TextFormattingProps) {
  const [editor] = useLexicalComposerContext()

  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isSubscript, setIsSubscript] = useState(false)
  const [isSuperscript, setIsSuperscript] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)

  const activeTextFormattingType = [
    isBold ? 'bold' : '',
    isItalic ? 'italic' : '',
    isUnderline ? 'underline' : '',
    isSubscript ? 'subscript' : '',
    isSuperscript ? 'superscript' : '',
    isStrikethrough ? 'strikethrough' : '',
  ].filter(Boolean)

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsSubscript(selection.hasFormat('subscript'))
      setIsSuperscript(selection.hasFormat('superscript'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
    }
  }, [])

  // Central registerUpdateListener use apiRef to handle method
  useImperativeHandle(apiRef, () => ({
    $updateToolbar,
  }))

  return (
    <ToggleGroup
      variant="outline"
      type="multiple"
      size="sm"
      value={activeTextFormattingType}
    >
      <ToggleGroupItem
        value="bold"
        title="Bold"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <IconBold />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="italic"
        title="Italic"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <IconItalic />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="underline"
        title="Underline"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <IconUnderline />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="lowercase"
        title="Lowercase"
        onClick={() =>
          editor.dispatchCommand(TRANSFORM_TEXT_CASE_COMMAND, 'lowercase')
        }
      >
        <IconLetterCaseLower />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="capitalize"
        title="Capitalize"
        onClick={() =>
          editor.dispatchCommand(TRANSFORM_TEXT_CASE_COMMAND, 'capitalize')
        }
      >
        <IconLetterCaseToggle />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="uppercase"
        title="Uppercase"
        onClick={() =>
          editor.dispatchCommand(TRANSFORM_TEXT_CASE_COMMAND, 'uppercase')
        }
      >
        <IconLetterCaseUpper />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="subscript"
        title="Subscript"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
      >
        <IconSubscript />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="superscript"
        title="Superscript"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')
        }
      >
        <IconSuperscript />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="strikethrough"
        title="Strikethrough"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
      >
        <IconStrikethrough />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
