import { ApiRefType } from '.'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $patchStyleText } from '@lexical/selection'
import { IconHighlight, IconPaint, IconPalette } from '@tabler/icons-react'
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  FORMAT_TEXT_COMMAND,
} from 'lexical'
import { useCallback, useImperativeHandle, useState } from 'react'

import { ColorPaletteComponent } from '@/components/editor/components/color-palette.component'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { DialogComponent } from '../../components/dialog.component'

type ColorFormattingProps = { apiRef: ApiRefType }
export function ColorFormatting({ apiRef }: ColorFormattingProps) {
  const [editor] = useLexicalComposerContext()
  const [isHighlight, setIsHighlight] = useState(false)
  const [textColor, setTextColor] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('')
  const [show, setShow] = useState<'text' | 'background' | null>(null)

  const activeColorFormattingType = [isHighlight ? 'highlight' : ''].filter(
    Boolean,
  )

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()

      setIsHighlight(selection.hasFormat('highlight'))

      if ($isTextNode(anchorNode)) {
        const styles = anchorNode.getStyle() || ''

        // Get all style properties as separate matches
        const colorMatch = styles.match(/(?:^|;\s*)color:\s*([^;]+)/)
        const bgMatch = styles.match(/(?:^|;\s*)background-color:\s*([^;]+)/)

        if (colorMatch) {
          setTextColor(colorMatch[1])
        } else {
          setTextColor('')
        }

        if (bgMatch) {
          setBackgroundColor(bgMatch[1])
        } else {
          // Check parent element for background color
          const parent = anchorNode.getParent()
          if ($isElementNode(parent)) {
            const parentStyles = parent.getStyle() || ''
            const parentBgMatch = parentStyles.match(
              /(?:^|;\s*)background-color:\s*([^;]+)/,
            )
            if (parentBgMatch) {
              setBackgroundColor(parentBgMatch[1])
            } else {
              setBackgroundColor('')
            }
          } else {
            setBackgroundColor('')
          }
        }
      } else {
        setTextColor('')
        setBackgroundColor('')
      }
    }
  }, [])

  // Central registerUpdateListener use apiRef to handle method
  useImperativeHandle(apiRef, () => ({
    $updateToolbar,
  }))

  const formatTextColor = useCallback(
    (color: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { color })
        }
      })

      setTextColor(color)
    },
    [editor],
  )

  const formatBackgroundColor = useCallback(
    (color: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { 'background-color': color })
        }
      })
      setBackgroundColor(color)
    },
    [editor],
  )

  const formatTextColorClear = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color: '' })
      }
    })
    setTextColor('')
  }, [editor])

  const formatBackgroundColorClear = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { 'background-color': '' })
      }
    })
    setBackgroundColor('')
  }, [editor])

  function handleShowColorPicker(type: 'text' | 'background') {
    setShow(show === type ? null : type)
  }

  return (
    <ToggleGroup
      className="relative"
      variant="outline"
      type="multiple"
      size="sm"
      value={activeColorFormattingType}
    >
      <ToggleGroupItem
        value="highlight"
        title="Hightlight"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')}
      >
        <IconHighlight />
      </ToggleGroupItem>
      <DialogComponent
        open={show === 'text'}
        onOpenChange={() => handleShowColorPicker('text')}
        renderTrigger={
          <ToggleGroupItem
            className="relative"
            value="text"
            title="Text Color"
            onClick={() => handleShowColorPicker('text')}
          >
            <IconPalette />
            <span
              className="absolute bottom-0.5 h-1 w-1/2 rounded-lg"
              style={{ backgroundColor: textColor }}
            />
          </ToggleGroupItem>
        }
        renderContent={
          <ColorPaletteComponent
            selectedColor={textColor}
            onSelect={formatTextColor}
            onClose={() => setShow(null)}
            onClear={formatTextColorClear}
          />
        }
      />

      <DialogComponent
        open={show === 'background'}
        onOpenChange={() => handleShowColorPicker('background')}
        renderTrigger={
          <ToggleGroupItem
            className="relative"
            value="background"
            title="Text Background"
            onClick={() => handleShowColorPicker('background')}
          >
            <IconPaint />
            <span
              className="absolute bottom-0.5 h-1 w-1/2 rounded-lg"
              style={{ backgroundColor }}
            />
          </ToggleGroupItem>
        }
        renderContent={
          <ColorPaletteComponent
            selectedColor={backgroundColor}
            onSelect={formatBackgroundColor}
            onClose={() => setShow(null)}
            onClear={formatBackgroundColorClear}
          />
        }
      />
    </ToggleGroup>
  )
}
