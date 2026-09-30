'use client'

import { ExtensionComponent } from '@lexical/react/ExtensionComponent'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { IconTextSize, IconTypography } from '@tabler/icons-react'
import { mergeRegister } from 'lexical'
import { useEffect, useRef } from 'react'

import {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  FONT_SIZE_OPTIONS,
  FONTS_FAMILY_OPTIONS,
} from './font/constant'

import { PagesReactExtension } from '../../extensions/pages/pages-react.extension'
import { Alignment } from './alignment'
import { Anchor } from './anchor'
import { BlockElements } from './block-elements'
import { Clear } from './clear'
import { Collapsible } from './collapsible'
import { ColorFormatting } from './color-formatting'
import { Divider } from './divider'
import { EditorMode } from './editor-mode'
import { Font } from './font'
import { Heading } from './heading'
import { History } from './history'
import { InsertImage } from './insert-image'
import { Lists } from './lists'
import { Poll } from './poll'
import { Table } from './table'
import { TextDirection } from './text-direction'
import { TextFormatting } from './text-formatting'

export const BUTTON_ACTIVE_CLASSES =
  'bg-accent text-accent-foreground dark:bg-accent/50'

export type ToolApi = { $updateToolbar: () => void }
export type ApiRefType = React.RefObject<ToolApi | null>
// TODO use "$addUpdateTag(SKIP_DOM_SELECTION_TAG); $addUpdateTag(SKIP_SCROLL_INTO_VIEW_TAG)" if don't want to move cursor/prevent auto-scrolling after applying format on node

const extensionProps = { 'lexical:extension': PagesReactExtension }

export function MinimalToolbarPlugin() {
  const [editor] = useLexicalComposerContext()

  const clearFormattingApiRef = useRef<ToolApi | null>(null)
  const textFormattingApiRef = useRef<ToolApi | null>(null)
  const headingApiRef = useRef<ToolApi | null>(null)
  const listsApiRef = useRef<ToolApi | null>(null)
  const alignmentApiRef = useRef<ToolApi | null>(null)
  const anchorApiRef = useRef<ToolApi | null>(null)

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            clearFormattingApiRef.current?.$updateToolbar()
            textFormattingApiRef.current?.$updateToolbar()
            headingApiRef.current?.$updateToolbar()
            listsApiRef.current?.$updateToolbar()
            alignmentApiRef.current?.$updateToolbar()
            anchorApiRef.current?.$updateToolbar()
          },
          { editor },
        )
      }),
    )
  }, [editor])

  return (
    <ToolbarWrapper>
      <Clear apiRef={clearFormattingApiRef} />
      <History />
      <TextFormatting apiRef={textFormattingApiRef} />
      <Heading apiRef={headingApiRef} />
      <Lists apiRef={listsApiRef} />
    </ToolbarWrapper>
  )
}

export function FullToolbarPlugin() {
  const [editor] = useLexicalComposerContext()

  const clearFormattingApiRef = useRef<ToolApi | null>(null)
  // const clipboardApiRef = useRef<ToolApi | null>(null)
  const fontSizeApiRef = useRef<ToolApi | null>(null)
  const fontFamilyApiRef = useRef<ToolApi | null>(null)
  const textFormattingApiRef = useRef<ToolApi | null>(null)
  const colorFormattingApiRef = useRef<ToolApi | null>(null)
  const blockElementsApiRef = useRef<ToolApi | null>(null)
  const headingApiRef = useRef<ToolApi | null>(null)
  const listsApiRef = useRef<ToolApi | null>(null)
  const alignmentApiRef = useRef<ToolApi | null>(null)
  const textDirectionApiRef = useRef<ToolApi | null>(null)
  const anchorApiRef = useRef<ToolApi | null>(null)
  const imageApiRef = useRef<ToolApi | null>(null)

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            clearFormattingApiRef.current?.$updateToolbar()
            // clipboardApiRef.current?.$updateToolbar()
            fontSizeApiRef.current?.$updateToolbar()
            fontFamilyApiRef.current?.$updateToolbar()
            textFormattingApiRef.current?.$updateToolbar()
            colorFormattingApiRef.current?.$updateToolbar()
            blockElementsApiRef.current?.$updateToolbar()
            headingApiRef.current?.$updateToolbar()
            listsApiRef.current?.$updateToolbar()
            alignmentApiRef.current?.$updateToolbar()
            textDirectionApiRef.current?.$updateToolbar()
            anchorApiRef.current?.$updateToolbar()
            imageApiRef.current?.$updateToolbar()
          },
          { editor },
        )
      }),
    )
  }, [editor])

  return (
    <ToolbarWrapper>
      <EditorMode />
      <ExtensionComponent {...extensionProps} />
      <Clear apiRef={clearFormattingApiRef} />
      {/* <Clipboard apiRef={clipboardApiRef} /> */}
      <History />
      <Font
        property="font-size"
        defaultValue={DEFAULT_FONT_SIZE}
        icon={IconTextSize}
        values={FONT_SIZE_OPTIONS}
        apiRef={fontSizeApiRef}
      />
      <Font
        property="font-family"
        defaultValue={DEFAULT_FONT_FAMILY}
        icon={IconTypography}
        selectDefaultValue
        values={FONTS_FAMILY_OPTIONS}
        apiRef={fontFamilyApiRef}
      />
      <TextFormatting apiRef={textFormattingApiRef} />
      <ColorFormatting apiRef={colorFormattingApiRef} />
      <BlockElements apiRef={blockElementsApiRef} />
      <Heading apiRef={headingApiRef} />
      <Lists apiRef={listsApiRef} />
      <Divider />
      <InsertImage apiRef={imageApiRef} />
      <Table />
      <Alignment apiRef={alignmentApiRef} />
      <TextDirection apiRef={textDirectionApiRef} />
      <Anchor apiRef={anchorApiRef} />
      <Collapsible />
      <Poll />
    </ToolbarWrapper>
  )
}

type ToolbarWrapperProps = { children: React.ReactNode }
function ToolbarWrapper({ children }: ToolbarWrapperProps) {
  return (
    <div className="bg-background flex flex-wrap gap-x-2 gap-y-1 rounded-tl-lg rounded-tr-lg border-b p-2 shadow-xs">
      {children}
    </div>
  )
}
// const canUseAsyncClipboard =
//   typeof navigator !== 'undefined' && !!navigator.clipboard

// const canWriteClipboard =
//   canUseAsyncClipboard &&
//   typeof navigator.clipboard.write === 'function' &&
//   typeof ClipboardItem !== 'undefined'

// const canReadClipboard =
//   canUseAsyncClipboard && typeof navigator.clipboard.read === 'function'

// TODO The clipboard operation is tested onyl for text, not non-text values
// type ClipboardProps = { apiRef: ApiRefType }
// function Clipboard({ apiRef }: ClipboardProps) {
//   const [editor] = useLexicalComposerContext()
//   const clipboardDataRef = useRef<{
//     type: 'copy' | 'cut' | null
//     plainText: string
//     html: string | null
//   }>({ type: null, plainText: '', html: null })
//   // TODO It doesn't copy inline styles, seems need @lexical/clipboard, I couldn't install it (I installed after stablished network)
//   const [canCopy, setCanCopy] = useState(false)
//   const [canCut, setCanCut] = useState(false)
//   const [canPaste, setCanPaste] = useState(false)

//   const $updateToolbar = useCallback(async () => {
//     const selection = $getSelection()

//     const isRangeSelected =
//       selection !== null &&
//       $isRangeSelection(selection) &&
//       !selection.isCollapsed()

//     const isNodeSelected = selection !== null && $isNodeSelection(selection)

//     // Copy: Enabled when something is selected
//     setCanCopy(isRangeSelected || isNodeSelected)

//     // Cut: Enabled when something is selected AND not currently cut
//     setCanCut(isRangeSelected || isNodeSelected)

//     const hasInternalClipboardData =
//       clipboardDataRef.current.plainText.length > 0 ||
//       clipboardDataRef.current.html !== null
//     setCanPaste(hasInternalClipboardData || canUseAsyncClipboard)
//   }, [])

//   const handleCopy = useCallback(async () => {
//     let plainText = ''
//     let html: string | null = null

//     editor.getEditorState().read(
//       () => {
//         const selection = $getSelection()
//         if (selection == null) return

//         plainText = selection.getTextContent()
//         html = $generateHtmlFromNodes(editor, selection)
//       },
//       { editor },
//     )

//     if (!plainText && !html) return

//     // Store internal fallback
//     clipboardDataRef.current = {
//       type: 'copy',
//       plainText,
//       html,
//     }
//     // Write to system clipboard
//     await writeToSystemClipboard(plainText, html)

//     setCanPaste(true)
//   }, [editor])

//   const handleCut = useCallback(async () => {
//     let plainText = ''
//     let html: string | null = null

//     editor.getEditorState().read(
//       () => {
//         const selection = $getSelection()
//         if (selection == null) return

//         if ($isRangeSelection(selection)) {
//           plainText = selection.getTextContent()
//           html = $generateHtmlFromNodes(editor, selection)
//         } else if ($isNodeSelection(selection)) {
//           const nodes = selection.getNodes()
//           plainText = nodes.map(n => n.getTextContent()).join('\n')
//           html = $generateHtmlFromNodes(editor, selection)
//         }
//       },
//       { editor },
//     )

//     if (!plainText && !html) return

//     // Store internal fallback
//     clipboardDataRef.current = { type: 'cut', plainText, html }
//     // Write to system clipboard
//     await writeToSystemClipboard(plainText, html)

//     // Remove content from editor
//     editor.update(() => {
//       const selection = $getSelection()
//       if ($isRangeSelection(selection)) {
//         selection.removeText()
//       } else if ($isNodeSelection(selection)) {
//         const nodes = selection.getNodes()
//         for (const node of nodes) {
//           node.remove()
//         }
//       }

//       setCanCut(false)
//       setCanPaste(true)
//     })
//   }, [editor])

//   const handlePaste = useCallback(async () => {
//     let pasteText = ''

//     if (canReadClipboard) {
//       try {
//         pasteText = await navigator.clipboard.readText()
//       } catch {
//         pasteText = clipboardDataRef.current.plainText || ''
//       }
//     } else {
//       pasteText = clipboardDataRef.current.plainText || ''
//     }

//     if (pasteText.length === 0) return

//     editor.update(() => {
//       const selection = $getSelection()
//       if ($isRangeSelection(selection)) {
//         selection.insertText(pasteText)
//       }
//     })
//   }, [editor])

//   const handlePasteFormatted = useCallback(async () => {
//     if (canReadClipboard) {
//       try {
//         const clipboardItems = await navigator.clipboard.read()
//         for (const item of clipboardItems) {
//           if (item.types.includes('text/html')) {
//             const blob = await item.getType('text/html')
//             const html = await blob.text()
//             editor.update(() => {
//               $insertHtmlIntoEditor(editor, html)
//             })
//             return
//           }
//         }
//         // No HTML found in clipboard, fall through to plain paste
//         await handlePaste()
//         return
//       } catch {
//         // Permission denied or failed, fall through to internal fallback
//       }
//     }

//     // Internal fallback
//     if (clipboardDataRef.current.html) {
//       editor.update(() => {
//         $insertHtmlIntoEditor(editor, clipboardDataRef.current.html!)
//       })
//     } else {
//       await handlePaste()
//     }
//   }, [editor, handlePaste])

//   // Central registerUpdateListener use apiRef to handle method
//   useImperativeHandle(apiRef, () => ({
//     $updateToolbar,
//   }))

//   useEffect(() => {
//     return mergeRegister(
//       editor.registerCommand(
//         COPY_COMMAND,
//         () => {
//           handleCopy()
//           return false
//         },
//         COMMAND_PRIORITY_HIGH,
//       ),
//       editor.registerCommand(
//         CUT_COMMAND,
//         () => {
//           handleCut()
//           return false
//         },
//         COMMAND_PRIORITY_HIGH,
//       ),
//       editor.registerCommand(
//         KEY_DOWN_COMMAND,
//         (e: KeyboardEvent) => {
//           const isModifier = /Mac|iPhone|iPad/.test(navigator.platform)
//             ? e.metaKey
//             : e.ctrlKey

//           if (isModifier && e.shiftKey && e.key.toLowerCase() === 'v') {
//             // Ctrl+Shift+V → plain text paste
//             // Without e.preventDefault() and return true, would be the issue double paste value
//             e.preventDefault()
//             handlePaste()
//             return true
//           }

//           // Normal Ctrl+V → let Lexical handle the rich paste automatically
//           return false
//         },
//         COMMAND_PRIORITY_HIGH,
//       ),
//     )
//   }, [editor, handleCopy, handleCut, handlePaste])

//   // Add onMouseDown to preserve editor selection
//   return (
//     <ButtonGroup>
//       <Button
//         disabled={!canCopy}
//         variant="outline"
//         size="sm"
//         title="Copy (Ctrl+C)"
//         onMouseDown={e => e.preventDefault()}
//         onClick={handleCopy}
//       >
//         <IconCopy />
//       </Button>
//       <Button
//         disabled={!canCut}
//         variant="outline"
//         size="sm"
//         title="Cut (Ctrl+X)"
//         onMouseDown={e => e.preventDefault()}
//         onClick={handleCut}
//       >
//         <IconCut />
//       </Button>
//       <Button
//         disabled={!canPaste}
//         variant="outline"
//         size="sm"
//         title="Paste (Ctrl+V)"
//         onMouseDown={e => e.preventDefault()}
//         onClick={handlePasteFormatted}
//       >
//         <IconClipboardList />
//       </Button>
//       <Button
//         disabled={!canPaste}
//         variant="outline"
//         size="sm"
//         title="Paste as plain text (Ctrl+Shift+V)"
//         onMouseDown={e => e.preventDefault()}
//         onClick={handlePaste}
//       >
//         <IconClipboardText />
//       </Button>
//     </ButtonGroup>
//   )
// }
// async function writeToSystemClipboard(plainText: string, html: string | null) {
//   if (!canWriteClipboard) return

//   try {
//     if (html) {
//       await navigator.clipboard.write([
//         new ClipboardItem({
//           'text/plain': new Blob([plainText], { type: 'text/plain' }),
//           'text/html': new Blob([html], { type: 'text/html' }),
//         }),
//       ])
//     } else {
//       await navigator.clipboard.writeText(plainText)
//     }
//   } catch {
//     // internal fallback already saved
//   }
// }
// function $insertHtmlIntoEditor(editor: LexicalEditor, html: string) {
//   const parser = new DOMParser()
//   const dom = parser.parseFromString(html, 'text/html')
//   const nodes = $generateNodesFromDOM(editor, dom)
//   const selection = $getSelection()
//   if ($isRangeSelection(selection)) {
//     selection.insertNodes(nodes)
//   }
// }
