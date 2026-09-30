import { ApiRefType } from '.'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
} from '@tabler/icons-react'
import {
  $getSelection,
  $isRangeSelection,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical'
import { useCallback, useImperativeHandle, useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type AlignmentProps = { apiRef: ApiRefType }

export function Alignment({ apiRef }: AlignmentProps) {
  const [editor] = useLexicalComposerContext()

  // const [isAlignLeft, setIsAlignLeft] = useState(false)
  const [isAlignCenter, setIsAlignCenter] = useState(false)
  const [isAlignRight, setIsAlignRight] = useState(false)
  const [isJustify, setIsJustify] = useState(false)

  const activeAlignment = isAlignCenter
    ? 'center'
    : isAlignRight
      ? 'right'
      : isJustify
        ? 'justify'
        : 'left' // Default

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      const element = anchorNode.getTopLevelElement()

      if (!element) return
      const elementFormat = element.getFormat()

      setIsAlignCenter(false)
      setIsAlignRight(false)
      setIsJustify(false)

      // 0 or 1 = left, 2 = center, 3 = right, 4 = justify
      if (elementFormat === 0 || elementFormat === 1) {
      } else if (elementFormat === 2) {
        setIsAlignCenter(true)
      } else if (elementFormat === 3) {
        setIsAlignRight(true)
      } else if (elementFormat === 4) {
        setIsJustify(true)
      }
    }
  }, [])

  // Central registerUpdateListener use apiRef to handle method
  useImperativeHandle(apiRef, () => ({
    $updateToolbar,
  }))

  const formatAlignment = useCallback(
    (alignmentType: ElementFormatType) => {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const anchorNode = selection.anchor.getNode()
        const element = anchorNode.getTopLevelElement()

        if (!element) return
        const currentFormat = element.getFormat()

        // Map alignment type to expected format number
        const alignmentMap: Partial<Record<ElementFormatType, number>> = {
          left: 1,
          center: 2,
          right: 3,
          justify: 4,
        }

        // If clicking the same alignment, toggle to left
        if (currentFormat === alignmentMap[alignmentType]) {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
        } else {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignmentType)
        }
      })
    },
    [editor],
  )

  return (
    <ToggleGroup
      variant="outline"
      type="single"
      size="sm"
      value={activeAlignment}
    >
      <ToggleGroupItem
        value="left"
        title="Align Left"
        onClick={() => formatAlignment('left')}
      >
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="center"
        title="Align Center"
        onClick={() => formatAlignment('center')}
      >
        <IconAlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="right"
        title="Align Right"
        onClick={() => formatAlignment('right')}
      >
        <IconAlignRight />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="justify"
        title="Justify"
        onClick={() => formatAlignment('justify')}
      >
        <IconAlignJustified />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
