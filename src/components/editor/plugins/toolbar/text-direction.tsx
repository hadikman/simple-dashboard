import { ApiRefType } from '.'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { IconPilcrowLeft, IconPilcrowRight } from '@tabler/icons-react'
import { $getSelection, $isRangeSelection } from 'lexical'
import { useCallback, useImperativeHandle, useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type TextDirectionProps = { apiRef: ApiRefType }

export function TextDirection({ apiRef }: TextDirectionProps) {
  const [editor] = useLexicalComposerContext()

  const [isRTL, setIsRTL] = useState(false)

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      const element = anchorNode.getTopLevelElement()

      if (!element) return
      const direction = element.getDirection()

      setIsRTL(direction === 'rtl')
    }
  }, [])

  // Central registerUpdateListener use apiRef to handle method
  useImperativeHandle(apiRef, () => ({
    $updateToolbar,
  }))

  const formatDirection = useCallback(
    (direction: 'ltr' | 'rtl') => {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const anchorNode = selection.anchor.getNode()
        const element = anchorNode.getTopLevelElement()

        if (!element) return

        element.setDirection(direction)
      })
    },
    [editor],
  )

  return (
    <ToggleGroup
      variant="outline"
      type="single"
      size="sm"
      value={isRTL ? 'rtl' : 'ltr'}
    >
      <ToggleGroupItem
        value="ltr"
        title="Left to Right"
        onClick={() => formatDirection('ltr')}
      >
        <IconPilcrowRight />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="rtl"
        title="Right to Left"
        onClick={() => formatDirection('rtl')}
      >
        <IconPilcrowLeft />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
