import type { Icon } from '@tabler/icons-react'
import type { ElementNode, LexicalNode } from 'lexical'
import type { LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

import './draggable-block.plugin.css'

import { useModalStore } from '@/store/zustand/modal/modal-stores-provider'
import { $createCodeNode } from '@lexical/code'
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/extension'
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconCode,
  IconColumns,
  IconGripVertical,
  IconHttpOptions,
  IconLayoutBottombarCollapse,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconLogs,
  IconPageBreak,
  IconPhoto,
  IconPlus,
  IconQuote,
  IconSeparatorHorizontal,
  IconTable,
} from '@tabler/icons-react'
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical'
import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import { INSERT_COLLAPSIBLE_COMMAND } from '../../extensions/collapsible/collapsible.extension'
import { INSERT_PAGE_BREAK } from '../../extensions/pages/page-break.extension'

const DRAGGABLE_BLOCK_MENU_CLASSNAME = 'draggable-block-menu'
export const MODAL_STORE_KEY = DRAGGABLE_BLOCK_MENU_CLASSNAME

type IconType = Icon | LucideIcon
type OptionType = {
  label: string
  icon: IconType
  keywords: string[]
  onSelect: () => void
}

export default function DraggableBlockPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const menuRef = useRef<HTMLDivElement>(null)
  const targetLineRef = useRef<HTMLDivElement>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  )
  // STANDBY Usefull
  // const [draggableElement, setDraggableElement] = useState<HTMLElement | null>(
  //   null,
  // )

  const [open, setOpen] = useState(false)
  const [isShiftHeld, setIsShiftHeld] = useState(false)

  const key = MODAL_STORE_KEY
  const setComponent = useModalStore(key!, state => state.setComponent)

  useEffect(() => {
    setPortalContainer(menuRef.current)
  }, [])

  // Track shift key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftHeld(true)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftHeld(false)
    }

    const onBlur = () => {
      setIsShiftHeld(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  // STANDBY Usefull
  // const setBlockType = (createNode: () => ElementNode) => {
  //   editor.update(() => {
  //     const selection = $getSelection()

  //     if ($isRangeSelection(selection)) {
  //       $setBlocksType(selection, createNode)
  //     }
  //   })
  // }

  const $findTopLevelBlock = useCallback((): LexicalNode | null => {
    const selection = $getSelection()
    const root = $getRoot()

    let node: LexicalNode | null = null

    if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes()
      if (nodes.length === 0) return null
      node = nodes[0]
    }

    if ($isRangeSelection(selection)) {
      node = selection.anchor.getNode()
    }

    if (!node) return null

    while (
      node !== null &&
      node.getParent() !== null &&
      node.getParent()?.getKey() !== root.getKey()
    ) {
      node = node.getParent()
    }

    return node
  }, [])

  const insertBlock = useCallback(
    (createNode: () => ElementNode, before: boolean) => {
      editor.update(() => {
        const topLevelBlock = $findTopLevelBlock()
        if (!topLevelBlock) return

        const newNode = createNode()

        if (before) {
          topLevelBlock.insertBefore(newNode)
        } else {
          topLevelBlock.insertAfter(newNode)
        }

        newNode.selectStart()
      })
    },
    [editor, $findTopLevelBlock],
  )

  const moveCursorAndDispatch = useCallback(
    (callback: () => void, before: boolean) => {
      editor.update(() => {
        const topLevelBlock = $findTopLevelBlock()
        if (!topLevelBlock) return

        const tempParagraph = $createParagraphNode()

        if (before) {
          topLevelBlock.insertBefore(tempParagraph)
        } else {
          topLevelBlock.insertAfter(tempParagraph)
        }

        tempParagraph.selectStart()
      })

      setTimeout(() => {
        callback()
      }, 0)
    },
    [editor, $findTopLevelBlock],
  )

  const headingOptions: OptionType[] = useMemo(
    () =>
      (
        [
          ['h1', 'Heading 1', Heading1Icon],
          ['h2', 'Heading 2', Heading2Icon],
          ['h3', 'Heading 3', Heading3Icon],
          ['h4', 'Heading 4', Heading4Icon],
        ] as const
      ).map(([tag, label, icon]) => ({
        label,
        icon,
        keywords: ['heading', 'header', tag],
        onSelect: () => insertBlock(() => $createHeadingNode(tag), isShiftHeld),
      })),
    [insertBlock, isShiftHeld],
  )

  const options: OptionType[] = useMemo(
    () => [
      {
        label: 'Paragraph',
        icon: IconLogs,
        keywords: ['normal', 'paragraph', 'p', 'text'],
        onSelect: () => insertBlock(() => $createParagraphNode(), isShiftHeld),
      },
      ...headingOptions,
      {
        label: 'Numbered List',
        icon: IconListNumbers,
        keywords: ['numbered list', 'ordered list', 'ol'],
        onSelect: () =>
          moveCursorAndDispatch(
            () =>
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
            isShiftHeld,
          ),
      },
      {
        label: 'Bulleted List',
        icon: IconList,
        keywords: ['bulleted list', 'unordered list', 'ul'],
        onSelect: () =>
          moveCursorAndDispatch(
            () =>
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
            isShiftHeld,
          ),
      },
      {
        label: 'Check List',
        icon: IconListCheck,
        keywords: ['check list', 'todo list'],
        onSelect: () =>
          moveCursorAndDispatch(
            () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
            isShiftHeld,
          ),
      },
      {
        label: 'Image',
        icon: IconPhoto,
        keywords: ['image', 'photo', 'picture', 'file'],
        onSelect: () =>
          moveCursorAndDispatch(() => setComponent('image'), isShiftHeld),
      },
      {
        label: 'Table',
        icon: IconTable,
        keywords: ['table', 'grid', 'spreadsheet', 'rows', 'columns'],
        onSelect: () =>
          moveCursorAndDispatch(() => setComponent('table'), isShiftHeld),
      },
      {
        label: 'Layout',
        icon: IconColumns,
        keywords: ['layout', 'columns', 'grid'],
        onSelect: () =>
          moveCursorAndDispatch(() => setComponent('layout'), isShiftHeld),
      },
      {
        label: 'Align left',
        icon: IconAlignLeft,
        keywords: ['align', 'justify', 'left'],
        onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'),
      },
      {
        label: 'Align center',
        icon: IconAlignCenter,
        keywords: ['align', 'justify', 'center'],
        onSelect: () =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'),
      },
      {
        label: 'Align right',
        icon: IconAlignRight,
        keywords: ['align', 'justify', 'right'],
        onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'),
      },
      {
        label: 'Align justify',
        icon: IconAlignJustified,
        keywords: ['align', 'justify'],
        onSelect: () =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify'),
      },
      {
        label: 'Horizontal Line',
        icon: IconSeparatorHorizontal,
        keywords: ['horizontal rule', 'divider', 'hr'],
        onSelect: () =>
          moveCursorAndDispatch(
            () =>
              editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
            isShiftHeld,
          ),
      },
      {
        label: 'Page Break',
        icon: IconPageBreak,
        keywords: ['page break', 'divider'],
        onSelect: () =>
          moveCursorAndDispatch(
            () => editor.dispatchCommand(INSERT_PAGE_BREAK, undefined),
            isShiftHeld,
          ),
      },
      {
        label: 'Collapsible',
        icon: IconLayoutBottombarCollapse,
        keywords: ['collapse', 'collapsible', 'toggle'],
        onSelect: () =>
          moveCursorAndDispatch(
            () => editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
            isShiftHeld,
          ),
      },
      {
        label: 'Poll',
        icon: IconHttpOptions,
        keywords: ['poll', 'voting', 'survey', 'feedback', 'opinion'],
        onSelect: () =>
          moveCursorAndDispatch(() => setComponent('poll'), isShiftHeld),
      },
      {
        label: 'Quote',
        icon: IconQuote,
        keywords: ['block quote'],
        onSelect: () => insertBlock(() => $createQuoteNode(), isShiftHeld),
      },
      {
        label: 'Code',
        icon: IconCode,
        keywords: ['javascript', 'python', 'js', 'codeblock'],
        onSelect: () => insertBlock(() => $createCodeNode(), isShiftHeld),
      },
    ],
    [
      editor,
      headingOptions,
      insertBlock,
      moveCursorAndDispatch,
      setComponent,
      isShiftHeld,
    ],
  )

  const isOnMenu = useCallback(
    (element: HTMLElement): boolean => {
      if (open) {
        return true
      }
      return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`)
    },
    [open],
  )

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchorElem}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      menuComponent={
        <div ref={menuRef} className="draggable-block-menu">
          <ButtonGroup>
            <Button
              variant="ghost"
              size="icon-xs"
              title="Click to add below (hold Shift to add before)"
              onClick={() => setOpen(true)}
            >
              <IconPlus />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="cursor-grab active:cursor-grabbing"
            >
              <IconGripVertical />
            </Button>
          </ButtonGroup>

          <CommandDialog
            // Set static height/position for dialog
            className="top-0 left-0 z-100 h-65 w-2xs translate-0"
            container={portalContainer}
            open={open}
            showCloseButton
            modal={false}
            onOpenChange={setOpen}
          >
            <Command
              filter={(value, search, keywords) => {
                const term = search.toLowerCase()
                const haystack =
                  `${value} ${(keywords ?? []).join(' ')}`.toLowerCase()
                return haystack.includes(term) ? 1 : 0
              }}
            >
              <CommandInput placeholder="Type a component or search..." />
              <CommandList>
                <CommandEmpty>No component found.</CommandEmpty>
                <CommandGroup heading="General">
                  {options.map(({ label, keywords, icon: Icon, onSelect }) => (
                    <CommandItem
                      key={label}
                      value={label}
                      keywords={keywords}
                      onSelect={() => {
                        setOpen(false)
                        onSelect()
                      }}
                    >
                      <Icon />
                      {label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </CommandDialog>
        </div>
      }
      targetLineComponent={
        <div ref={targetLineRef} className="draggable-block-target-line" />
      }
      isOnMenu={isOnMenu}
      // STANDBY
      // onElementChanged={setDraggableElement}
    />
  )
}
