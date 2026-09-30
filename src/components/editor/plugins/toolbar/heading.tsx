import { ApiRefType } from '.'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical'
import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
} from 'lucide-react'
import { useCallback, useImperativeHandle, useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type HeadingProps = { apiRef: ApiRefType }

export function Heading({ apiRef }: HeadingProps) {
  const [editor] = useLexicalComposerContext()

  const [isH1, setIsH1] = useState(false)
  const [isH2, setIsH2] = useState(false)
  const [isH3, setIsH3] = useState(false)
  const [isH4, setIsH4] = useState(false)

  const activeHeadingType = [
    isH1 ? 'h1' : '',
    isH2 ? 'h2' : '',
    isH3 ? 'h3' : '',
    isH4 ? 'h4' : '',
  ].filter(Boolean)

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      const element = anchorNode.getTopLevelElement()

      if (!element) return

      if ($isHeadingNode(element)) {
        const tag = element.getTag()
        setIsH1(tag === 'h1')
        setIsH2(tag === 'h2')
        setIsH3(tag === 'h3')
        setIsH4(tag === 'h4')
      } else {
        setIsH1(false)
        setIsH2(false)
        setIsH3(false)
        setIsH4(false)
      }
    }
  }, [])

  // Central registerUpdateListener use apiRef to handle method
  useImperativeHandle(apiRef, () => ({
    $updateToolbar,
  }))

  const formatHeading = useCallback(
    (headingTag: HeadingTagType) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode()
          const element = anchorNode.getTopLevelElement()

          if (!element) return

          if ($isHeadingNode(element)) {
            const currentTag = element.getTag()

            if (currentTag === headingTag) {
              $setBlocksType(selection, () => $createParagraphNode())
            } else {
              $setBlocksType(selection, () => $createHeadingNode(headingTag))
            }
          } else {
            $setBlocksType(selection, () => $createHeadingNode(headingTag))
          }
        }
      })
    },
    [editor],
  )

  return (
    <ToggleGroup
      variant="outline"
      type="multiple"
      size="sm"
      value={activeHeadingType}
    >
      <ToggleGroupItem
        value="h1"
        title="H1"
        onClick={() => formatHeading('h1')}
      >
        <Heading1Icon />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="h2"
        title="H2"
        onClick={() => formatHeading('h2')}
      >
        <Heading2Icon />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="h3"
        title="H3"
        onClick={() => formatHeading('h3')}
      >
        <Heading3Icon />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="h4"
        title="H4"
        onClick={() => formatHeading('h4')}
      >
        <Heading4Icon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
