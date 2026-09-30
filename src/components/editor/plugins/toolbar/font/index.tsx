import type { Icon } from '@tabler/icons-react'
import { ApiRefType } from '..'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $patchStyleText } from '@lexical/selection'
import { $getSelection, $isRangeSelection, $isTextNode } from 'lexical'
import { useCallback, useImperativeHandle, useRef, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type FontType = {
  property: 'font-size' | 'font-family'
  defaultValue: string
  icon?: Icon
  label?: string
  selectDefaultValue?: boolean
  values: string[]
  apiRef: ApiRefType
}

export function Font({
  property,
  defaultValue,
  icon,
  label,
  selectDefaultValue,
  values,
  apiRef,
}: FontType) {
  const [editor] = useLexicalComposerContext()
  const [fontValue, setFontFamily] = useState(defaultValue)
  const justAppliedRef = useRef(false)
  const Icon = icon

  const $updateToolbar = useCallback(() => {
    // Skip if we just applied a font size it would shows the correct font size after selecting immediately
    if (justAppliedRef.current) {
      justAppliedRef.current = false
      return
    }

    const selection = $getSelection()

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()

      if ($isTextNode(anchorNode)) {
        const styles = anchorNode.getStyle() || ''
        const fontFamilyMatch = styles.match(getCSSPropertyRegex(property))

        if (fontFamilyMatch) {
          const family = fontFamilyMatch[1].replace(/['"]/g, '')
          setFontFamily(family)
        } else {
          setFontFamily(defaultValue)
        }
      } else {
        setFontFamily(defaultValue)
      }
    }
  }, [defaultValue, property])

  const applyFont = useCallback(
    (value: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const anchorNode = selection.anchor.getNode()

        let currentValue = defaultValue

        if ($isTextNode(anchorNode)) {
          const styles = anchorNode.getStyle() || ''
          const match = styles.match(getCSSPropertyRegex(property))
          if (match) {
            currentValue = match[1].replace(/['"]/g, '')
          }
        }

        const shouldRemove = currentValue === value

        if (shouldRemove) {
          $patchStyleText(selection, {
            [property]: '',
          })
          setFontFamily(defaultValue)
        } else {
          $patchStyleText(selection, {
            [property]: value,
          })
          setFontFamily(value)
        }

        // ✅ Set flag to skip next $updateToolbar
        justAppliedRef.current = true
      })
    },
    [defaultValue, editor, property],
  )

  // Central registerUpdateListener use apiRef to handle method
  useImperativeHandle(apiRef, () => ({
    $updateToolbar,
  }))

  return (
    <Select value={fontValue} onValueChange={applyFont}>
      <SelectTrigger
        data-is-lg={property === 'font-family'}
        className="h-8 w-26 text-xs data-[is-lg=true]:w-36"
        size="default"
      >
        {Icon && <Icon />}
        {label}
        <SelectValue>
          {selectDefaultValue
            ? fontValue === defaultValue
              ? 'Default'
              : fontValue
            : fontValue}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {selectDefaultValue ? (
          <>
            <SelectGroup>
              <SelectItem value={defaultValue} className="text-sm">
                Default Font
              </SelectItem>
            </SelectGroup>
            <SelectSeparator />
          </>
        ) : null}
        <SelectGroup>
          {values.map(value => (
            <SelectItem
              key={value}
              value={value}
              className="text-sm"
              {...(property === 'font-family' && {
                style: { fontFamily: value },
              })}
            >
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function getCSSPropertyRegex(propertyName: string) {
  return new RegExp(`(?:^|;\\s*)${propertyName}:\\s*([^;]+)`)
}
