import { ApiRefType } from '.'

import {
  $insertList,
  $isListNode,
  $removeList,
  ListItemNode,
  ListNode,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNearestNodeOfType } from '@lexical/utils'
import {
  IconIndentDecrease,
  IconIndentIncrease,
  IconList,
  IconListCheck,
  IconListNumbers,
} from '@tabler/icons-react'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  INDENT_CONTENT_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical'
import { useCallback, useEffect, useImperativeHandle, useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type ListsProps = { apiRef: ApiRefType }

export function Lists({ apiRef }: ListsProps) {
  const [editor] = useLexicalComposerContext()

  const [isUnorderedList, setIsUnorderedList] = useState(false)
  const [isOrderedList, setIsOrderedList] = useState(false)
  const [isCheckedList, setIsCheckedList] = useState(false)

  const activeListType = [
    isUnorderedList ? 'unordered' : '',
    isOrderedList ? 'ordered' : '',
    isCheckedList ? 'check' : '',
  ].filter(Boolean)

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      const element = anchorNode.getTopLevelElement()

      if (!element) return

      // Find the nearest list item to detect list type
      const listItem = $getNearestNodeOfType(anchorNode, ListItemNode)
      if (listItem) {
        const parentList = $getNearestNodeOfType(listItem, ListNode)
        if (parentList) {
          const listType = parentList.getListType()
          setIsUnorderedList(listType === 'bullet')
          setIsOrderedList(listType === 'number')
          setIsCheckedList(listType === 'check')
        } else {
          setIsUnorderedList(false)
          setIsOrderedList(false)
          setIsCheckedList(false)
        }
      } else if ($isListNode(element)) {
        const listType = element.getListType()
        setIsUnorderedList(listType === 'bullet')
        setIsOrderedList(listType === 'number')
        setIsCheckedList(listType === 'check')
      } else {
        setIsUnorderedList(false)
        setIsOrderedList(false)
        setIsCheckedList(false)
      }
    }
  }, [])

  // Central registerUpdateListener use apiRef to handle method
  useImperativeHandle(apiRef, () => ({
    $updateToolbar,
  }))

  useEffect(() => {
    return editor.registerCommand(
      KEY_TAB_COMMAND,
      (e: KeyboardEvent) => {
        e.preventDefault()

        return editor.dispatchCommand(
          e.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
          undefined,
        )
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  const formatList = useCallback(
    (listType: 'unordered' | 'ordered' | 'check') => {
      const targetType =
        listType === 'unordered'
          ? 'bullet'
          : listType === 'ordered'
            ? 'number'
            : 'check'

      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const anchorNode = selection.anchor.getNode()
        const listItem = $getNearestNodeOfType(anchorNode, ListItemNode)

        let currentList: ListNode | null = null

        if (listItem) {
          currentList = $getNearestNodeOfType(listItem, ListNode)
        } else {
          const topLevel = anchorNode.getTopLevelElement()
          if (topLevel && $isListNode(topLevel)) {
            currentList = topLevel
          }
        }

        if (currentList?.getListType() === targetType) {
          $removeList()
        } else {
          $insertList(targetType)
        }
      })
    },
    [editor],
  )

  const formatIndent = useCallback(
    (direction: 'indent' | 'outdent') => {
      editor.update(() => {
        if (direction === 'indent') {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
        } else {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
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
      value={activeListType}
    >
      <ToggleGroupItem
        value="unordered"
        title="Bullet List"
        onClick={() => formatList('unordered')}
      >
        <IconList />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="ordered"
        title="Number List"
        onClick={() => formatList('ordered')}
      >
        <IconListNumbers />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="check"
        title="Check List"
        onClick={() => formatList('check')}
      >
        <IconListCheck />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="indent"
        title="Indentation"
        onClick={() => formatIndent('indent')}
      >
        <IconIndentIncrease />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="outdent"
        title="Outdentation"
        onClick={() => formatIndent('outdent')}
      >
        <IconIndentDecrease />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
