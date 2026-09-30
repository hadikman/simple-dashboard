import type { JSX } from 'react'

import {
  autoUpdate,
  flip,
  inline,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react'
import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isAtNodeEnd } from '@lexical/selection'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import {
  IconCancel,
  IconCheck,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'
import {
  $getSelection,
  $isDecoratorNode,
  $isLineBreakNode,
  $isNodeSelection,
  $isRangeSelection,
  BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  ElementNode,
  getDOMSelection,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
  TextNode,
} from 'lexical'
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Item, ItemActions, ItemContent } from '@/components/ui/item'
import { sanitizeUrl } from './toolbar/anchor/utils'

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
}: {
  editor: LexicalEditor
  isLink: boolean
  setIsLink: Dispatch<boolean>
  anchorElem: HTMLElement
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [editedLinkUrl, setEditedLinkUrl] = useState('https://')
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(null)

  const [isLinkEditMode, setIsLinkEditMode] = useState(false)

  const scrollerElem = anchorElem.parentElement

  const { refs, floatingStyles } = useFloating({
    middleware: [
      inline(),
      offset(10),
      flip({
        boundary: scrollerElem || undefined,
        padding: 10,
      }),
      shift({
        boundary: scrollerElem || undefined,
        crossAxis: true,
        mainAxis: true,
        padding: 10,
      }),
    ],
    placement: 'bottom-start',
    strategy: 'absolute',
    whileElementsMounted: (...args) =>
      autoUpdate(...args, { ancestorScroll: false }),
  })

  const $updateLinkEditor = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const linkNode = $getSelectedLinkNode(selection)
      if (linkNode) {
        setLinkUrl(linkNode.getURL())
      } else {
        setLinkUrl('')
      }
      if (isLinkEditMode) {
        setEditedLinkUrl(linkUrl)
      }
    } else if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes()
      if (nodes.length > 0) {
        const node = nodes[0]
        const parent = node.getParent()
        if ($isLinkNode(parent)) {
          setLinkUrl(parent.getURL())
        } else if ($isLinkNode(node)) {
          setLinkUrl(node.getURL())
        } else {
          setLinkUrl('')
        }
        if (isLinkEditMode) {
          setEditedLinkUrl(linkUrl)
        }
      }
    }

    const nativeSelection = getDOMSelection(editor._window)
    const activeElement = document.activeElement

    const rootElement = editor.getRootElement()

    if (selection !== null && rootElement !== null && editor.isEditable()) {
      let referenceElement: Element | null = null

      if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes()
        if (nodes.length > 0) {
          referenceElement = editor.getElementByKey(nodes[0].getKey())
        }
      } else if (
        $isRangeSelection(selection) &&
        nativeSelection !== null &&
        nativeSelection.rangeCount > 0 &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
        const linkNode = $getSelectedLinkNode(selection)
        if (linkNode) {
          // For decorator-only links (e.g. linked images), anchor to the
          // decorator's element since the link's line box may not match
          // the decorator's visual extent.
          const onlyChild =
            linkNode.getChildrenSize() === 1 ? linkNode.getFirstChild() : null
          referenceElement =
            onlyChild && $isDecoratorNode(onlyChild)
              ? editor.getElementByKey(onlyChild.getKey())
              : editor.getElementByKey(linkNode.getKey())
        }
      }

      if (referenceElement) {
        // Use a virtual element exposing both rect methods so `inline`
        // can read client rects reliably.
        const refEl = referenceElement
        refs.setPositionReference({
          getBoundingClientRect: () => refEl.getBoundingClientRect(),
          getClientRects: () => refEl.getClientRects(),
        })
      } else if (
        nativeSelection !== null &&
        nativeSelection.rangeCount > 0 &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
        refs.setPositionReference(nativeSelection.getRangeAt(0))
      }
      setLastSelection(selection)
    } else if (!activeElement || activeElement.className !== 'link-input') {
      setLastSelection(null)
      setIsLinkEditMode(false)
      setLinkUrl('')
    }

    return true
  }, [editor, setIsLinkEditMode, isLinkEditMode, linkUrl, refs])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateLinkEditor()
        })
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateLinkEditor()
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor, $updateLinkEditor, setIsLink, isLink])

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateLinkEditor()
    })
  }, [editor, $updateLinkEditor])

  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLinkEditMode, isLink])

  useEffect(() => {
    const editorElement = editorRef.current
    if (editorElement === null) {
      return
    }
    const handleBlur = (event: FocusEvent) => {
      if (!editorElement.contains(event.relatedTarget as Element) && isLink) {
        setIsLink(false)
        setIsLinkEditMode(false)
      }
    }
    editorElement.addEventListener('focusout', handleBlur)
    return () => {
      editorElement.removeEventListener('focusout', handleBlur)
    }
  }, [editorRef, setIsLink, setIsLinkEditMode, isLink])

  const monitorInputInteraction = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      handleLinkSubmission(event)
    } else if (event.key === 'Escape') {
      preventDefault(event)
      setIsLinkEditMode(false)
    }
  }

  const handleLinkSubmission = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLElement>,
  ) => {
    preventDefault(event)
    if (lastSelection !== null) {
      if (linkUrl !== '') {
        editor.update(() => {
          editor.dispatchCommand(
            TOGGLE_LINK_COMMAND,
            sanitizeUrl(editedLinkUrl),
          )
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const parent = getSelectedNode(selection).getParent()
            if ($isAutoLinkNode(parent)) {
              const linkNode = $createLinkNode(parent.getURL(), {
                rel: parent.__rel,
                target: parent.__target,
                title: parent.__title,
              })
              parent.replace(linkNode, true)
            }
          }
        })
      }
      setEditedLinkUrl('https://')
      setIsLinkEditMode(false)
    }
  }

  return (
    <Item
      ref={el => {
        editorRef.current = el
        refs.setFloating(el)
      }}
      className="bg-background z-50 shadow"
      variant="outline"
      size="sm"
      style={{
        ...floatingStyles,
        opacity: isLink ? 1 : 0,
        pointerEvents: isLink ? 'auto' : 'none',
      }}
    >
      {!isLink ? null : isLinkEditMode ? (
        <>
          <ItemContent>
            <Input
              ref={inputRef}
              value={editedLinkUrl}
              onChange={event => {
                setEditedLinkUrl(event.target.value)
              }}
              onKeyDown={event => {
                monitorInputInteraction(event)
              }}
            />
          </ItemContent>
          <ItemActions>
            <Button
              variant="ghost"
              size="icon-sm"
              role="button"
              tabIndex={0}
              onMouseDown={preventDefault}
              onClick={() => {
                setIsLinkEditMode(false)
              }}
            >
              <IconCancel />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              role="button"
              tabIndex={0}
              onMouseDown={preventDefault}
              onClick={handleLinkSubmission}
            >
              <IconCheck />
            </Button>
          </ItemActions>
        </>
      ) : (
        <>
          <ItemContent>
            <a
              href={sanitizeUrl(linkUrl)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkUrl}
            </a>
          </ItemContent>
          <ItemActions>
            <Button
              variant="ghost"
              size="icon-sm"
              role="button"
              tabIndex={0}
              onMouseDown={preventDefault}
              onClick={event => {
                preventDefault(event)
                setEditedLinkUrl(linkUrl)
                setIsLinkEditMode(true)
              }}
            >
              <IconPencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              role="button"
              tabIndex={0}
              onMouseDown={preventDefault}
              onClick={() => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
              }}
            >
              <IconTrash />
            </Button>
          </ItemActions>
        </>
      )}
    </Item>
  )
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor)
  const [isLink, setIsLink] = useState(false)

  useEffect(() => {
    function $updateToolbar() {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const focusLinkNode = $getSelectedLinkNode(selection)
        const focusNode = getSelectedNode(selection)
        const focusAutoLinkNode = $findMatchingParent(
          focusNode,
          $isAutoLinkNode,
        )
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false)
          return
        }
        const badNode = selection
          .getNodes()
          .filter(node => !$isLineBreakNode(node))
          .find(node => {
            const linkNode = $findMatchingParent(node, $isLinkNode)
            const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode)
            return (
              (focusLinkNode && !focusLinkNode.is(linkNode)) ||
              (linkNode && !linkNode.is(focusLinkNode)) ||
              (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
              (autoLinkNode &&
                (!autoLinkNode.is(focusAutoLinkNode) ||
                  autoLinkNode.getIsUnlinked()))
            )
          })
        if (!badNode) {
          setIsLink(true)
        } else {
          setIsLink(false)
        }
      } else if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes()
        if (nodes.length === 0) {
          setIsLink(false)
          return
        }
        const node = nodes[0]
        const parent = node.getParent()
        if ($isLinkNode(parent) || $isLinkNode(node)) {
          setIsLink(true)
        } else {
          setIsLink(false)
        }
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          $updateToolbar()
          setActiveEditor(newEditor)
          return false
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        payload => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection)
            const linkNode = $findMatchingParent(node, $isLinkNode)
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), '_blank')
              return true
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
    />,
    anchorElem,
  )
}

function $getSelectedLinkNode(selection: RangeSelection): LinkNode | null {
  const node = getSelectedNode(selection)
  // 1. Node itself is a link
  if ($isLinkNode(node)) {
    return node
  }
  // 2. Parent is a link
  const linkParent = $findMatchingParent(node, $isLinkNode)
  if ($isLinkNode(linkParent)) {
    return linkParent
  }
  // 3. Right-biased adjacent link (for single-char links)
  if (selection.isCollapsed()) {
    const anchor = selection.anchor
    if (anchor.type === 'text') {
      const anchorNode = anchor.getNode()
      if (anchor.offset === anchorNode.getTextContentSize()) {
        const nextSibling = anchorNode.getNextSibling()
        if ($isLinkNode(nextSibling)) {
          return nextSibling
        }
      }
    }
  }
  return null
}

function preventDefault(
  event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>,
): void {
  event.preventDefault()
}

export default function FloatingLinkEditorPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  return useFloatingLinkEditorToolbar(editor, anchorElem)
}

export function getSelectedNode(
  selection: RangeSelection,
): TextNode | ElementNode {
  const anchor = selection.anchor
  const focus = selection.focus
  const anchorNode = selection.anchor.getNode()
  const focusNode = selection.focus.getNode()
  if (anchorNode === focusNode) {
    return anchorNode
  }
  const isBackward = selection.isBackward()
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode
  }
}
