'use client'

import dynamic from 'next/dynamic'

const DraggableBlockPlugin = dynamic(
  () => import('./plugins/draggable-block/draggable-block.plugin'),
  { ssr: false },
)
const TableCellResizer = dynamic(
  () => import('./plugins/table/table-cell-resizer'),
  {
    ssr: false,
  },
)
const TableCellActionMenuPlugin = dynamic(
  () => import('./plugins/table/table-action-menu.plugin'),
  { ssr: false },
)
const TableHoverActionsV2Plugin = dynamic(
  () => import('./plugins/table/table-hover-actions-v2.plugin'),
  { ssr: false },
)
const FloatingLinkEditorPlugin = dynamic(
  () => import('./plugins/floating-link-editor.plugin'),
  { ssr: false },
)

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { HorizontalRuleExtension } from '@lexical/extension'
import { HistoryExtension } from '@lexical/history'
import { AutoLinkNode, LinkExtension, LinkNode } from '@lexical/link'
import {
  CheckListExtension,
  ListExtension,
  ListItemNode,
  ListNode,
} from '@lexical/list'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer'
// import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { ReactExtension } from '@lexical/react/ReactExtension'
import { HeadingNode, QuoteNode, RichTextExtension } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import {
  // $getRoot,
  $isTextNode,
  configExtension,
  defineExtension,
  DOMConversionMap,
  // EditorState,
  ParagraphNode,
  TextNode,
} from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CollapsibleExtension } from './extensions/collapsible/collapsible.extension'
import { ImagesExtension } from './extensions/image/images.extension'
import { LayoutExtension } from './extensions/layout.extension'
import { PageBreakExtension } from './extensions/pages/page-break.extension'
import { PagesReactExtension } from './extensions/pages/pages-react.extension'
import { PollExtension } from './extensions/poll.extension'
import { TerseExportExtension } from './extensions/terse-export.extension'
import { TransformTextCaseExtension } from './extensions/transform-text-case.extension'

// import {
//   TreeViewExtension,
//   TreeViewExtensionComponent,
// } from './extensions/tree-view.extension'

import { AnchorNode } from './nodes/anchor.node'
import { LayoutContainerNode } from './nodes/layout/layout-container.node'
import { LayoutItemNode } from './nodes/layout/layout-item.node'
import { PageBreakNode } from './nodes/page-break/page-break.node'
import { PollNode } from './nodes/poll/poll.node'
import { $createCustomTableNode, CustomTableNode } from './nodes/table.node'

import { BlockNodeEscapePlugin } from './plugins/block-node-escape-plugin'
import { BlurPlugin } from './plugins/blur-plugin'
// import { ExportPlugin } from './plugins/export.plugin'
import { CodeGutterPlugin } from './plugins/code-gutter.plugin'
import { CheckListRestrictionPlugin } from './plugins/list/check-list-restriction.plugin'
import { ListNumberValueNormalizerPlugin } from './plugins/list/list-number-value-normalizer.plugin'
import { SelectionMonitorPlugin } from './plugins/selection-monitor.plugin'
import { EditorFieldValue, SyncPlugin } from './plugins/sync.plugin'
import { TableCellDeletePlugin } from './plugins/table/table-cell-delete.plugin'
import { TableFitNestedTablePlugin } from './plugins/table/table-fit-nested-table.plugin'
import { TableScrollShadowPlugin } from './plugins/table/table-scroll-shadow.plugin'
import { FullToolbarPlugin, MinimalToolbarPlugin } from './plugins/toolbar'
import { TransformPlugin } from './plugins/transform.plugin'

import { cn } from '@/helpers/utils'
import { ModalStoresProvider } from '@/store/zustand/modal/modal-stores-provider'
import { EditorExtensionProps } from './store/zustand/create-editor-store'
import {
  EditorStoreProvider,
  useEditorStore,
} from './store/zustand/editor-store-provider'
import {
  getInheritedStyle,
  parseAllowedColor,
  parseAllowedFontSize,
} from './style-config'
import { theme } from './theme'

const baseNodes = [
  TextNode,
  ParagraphNode,
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  AutoLinkNode,
  LinkNode,
  CodeNode,
  CodeHighlightNode,
  AnchorNode,
]

const fullNodes = [
  ...baseNodes,
  CustomTableNode,
  {
    replace: TableNode,
    with: () => $createCustomTableNode(),
    withKlass: CustomTableNode,
  },
  TableCellNode,
  TableRowNode,
  PageBreakNode,
  LayoutContainerNode,
  LayoutItemNode,
  PollNode,
]

// const removeStylesExportDOM = (
//   editor: LexicalEditor,
//   target: LexicalNode,
// ): DOMExportOutput => {
//   const output = target.exportDOM(editor)
//   if (output && isHTMLElement(output.element)) {
//     // Remove all inline styles and classes if the element is an HTMLElement
//     // Children are checked as well since TextNode can be nested
//     // in i, b, and strong tags.
//     for (const el of [
//       output.element,
//       ...output.element.querySelectorAll('[style],[class]'),
//     ]) {
//       el.removeAttribute('class')
//       el.removeAttribute('style')
//     }
//   }
//   return output
// }

// const removeClassesExportDOM = (
//   editor: LexicalEditor,
//   target: LexicalNode,
// ): DOMExportOutput => {
//   const output = target.exportDOM(editor)

//   if (output && isHTMLElement(output.element)) {
//     for (const el of [
//       output.element,
//       ...output.element.querySelectorAll('[class]'),
//     ]) {
//       el.removeAttribute('class')
//     }
//   }

//   return output
// }

// const exportMap: DOMExportOutputMap = new Map<
//   Klass<LexicalNode>,
//   (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
// >([
//   [ParagraphNode, removeClassesExportDOM],
//   [TextNode, removeClassesExportDOM],
// ])

const getExtraStyles = (element: HTMLElement): string => {
  // Parse styles from pasted input, but only if they match exactly the
  // sort of styles that would be produced by exportDOM
  let extraStyles = ''

  const fontSize = getInheritedStyle(element, 'font-size')
  const parsedFontSize = parseAllowedFontSize(fontSize)
  if (parsedFontSize !== '' && parsedFontSize !== '15px') {
    extraStyles += `font-size: ${parsedFontSize};`
  }

  const fontFamily = getInheritedStyle(element, 'font-family')
  if (fontFamily && fontFamily !== 'Arial') {
    extraStyles += `font-family: ${fontFamily};`
  }

  const backgroundColor = parseAllowedColor(element.style.backgroundColor)
  if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`
  }

  const color = getInheritedStyle(element, 'color')
  const parsedColor = parseAllowedColor(color)
  if (parsedColor !== '' && parsedColor !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${parsedColor};`
  }

  return extraStyles
}

const constructImportMap = (): DOMConversionMap => {
  const dynamicBaseMap = fullNodes.reduce((map, nodeItem) => {
    // 1. Determine which class to check for importDOM
    // If it's a replacement object, check the 'withKlass'. Otherwise, check the item itself.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const klass = (nodeItem as any).withKlass || nodeItem

    // 2. Safely call importDOM if it exists
    if (klass && typeof klass.importDOM === 'function') {
      return { ...map, ...klass.importDOM() }
    }

    return map
  }, {} as DOMConversionMap)

  const finalImportMap: DOMConversionMap = { ...dynamicBaseMap }

  // 2. Override TextNode importers with your custom style wrapper
  // We check dynamicBaseMap for the existing text tags (span, b, strong, etc.)
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    finalImportMap[tag] = importNode => {
      const importer = fn(importNode)
      if (!importer) return null

      return {
        ...importer,
        conversion: element => {
          const output = importer.conversion(element)
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output
          }

          const extraStyles = getExtraStyles(element as HTMLElement)
          if (extraStyles) {
            const { forChild } = output
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent)
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles)
                }
                return textNode
              },
            }
          }

          return output
        },
      }
    }
  }

  // 3. Apply the critical bypass for native HTML table wrappers
  finalImportMap.tbody = () => ({
    conversion: () => ({ node: null }),
    priority: 0,
  })
  finalImportMap.thead = () => ({
    conversion: () => ({ node: null }),
    priority: 0,
  })

  return finalImportMap
}

function onError(error: Error) {
  console.error(error)
}

export const baseExtensions = [
  RichTextExtension,
  HistoryExtension,
  ListExtension,
  CheckListExtension,
  TransformTextCaseExtension,
  TerseExportExtension,
  // TreeViewExtension,
]

export const minimalExtension = defineExtension({
  name: 'editor-minimal',
  namespace: 'EditorMinimal',
  html: {
    export: new Map([]),
    import: constructImportMap(),
  },
  dependencies: [
    ...baseExtensions,
    configExtension(ReactExtension, {
      contentEditable: <MinimalContentEditable />,
      ErrorBoundary: LexicalErrorBoundary,
    }),
  ],
  nodes: baseNodes,
  theme,
  onError,
})

export const fullExtensions = [
  ...baseExtensions,
  LinkExtension,
  HorizontalRuleExtension,
  PageBreakExtension,
  PagesReactExtension,
  LayoutExtension,
  PollExtension,
  CollapsibleExtension,
  ImagesExtension,
]

export const fullExtension = defineExtension({
  name: 'editor-full',
  namespace: 'EditorFull',
  html: {
    export: new Map([]),
    import: constructImportMap(),
  },
  dependencies: [
    ...fullExtensions,
    configExtension(ReactExtension, {
      contentEditable: <FullContentEditable />,
      ErrorBoundary: LexicalErrorBoundary,
    }),
  ],
  nodes: fullNodes,
  theme,
  onError,
})

function MinimalContentEditable() {
  const wrapperToolbarClassName = useEditorStore(s => s.wrapperToolbarClassName)
  const wrapperContentEditableClassName = useEditorStore(
    s => s.wrapperContentEditableClassName,
  )
  const wrapperSelectionMonitorClassName = useEditorStore(
    s => s.wrapperSelectionMonitorClassName,
  )

  return (
    <div className="grid max-w-full gap-2 rounded-lg border">
      <div
        className={cn(wrapperToolbarClassName, 'rounded-tl-lg rounded-tr-lg')}
      >
        <MinimalToolbarPlugin />
      </div>
      <div
        className={cn(
          wrapperContentEditableClassName,
          'relative min-h-52 px-3',
        )}
      >
        <ContentEditable className="ContentEditable__root" />
      </div>
      <div
        className={cn(
          wrapperSelectionMonitorClassName,
          'rounded-br-lg rounded-bl-lg',
        )}
      >
        <SelectionMonitorPlugin />
      </div>
    </div>
  )
}

function FullContentEditable() {
  const wrapperToolbarClassName = useEditorStore(s => s.wrapperToolbarClassName)
  const wrapperContentEditableClassName = useEditorStore(
    s => s.wrapperContentEditableClassName,
  )
  const wrapperSelectionMonitorClassName = useEditorStore(
    s => s.wrapperSelectionMonitorClassName,
  )

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="grid max-w-full gap-2 rounded-lg border">
      <div
        className={cn(wrapperToolbarClassName, 'rounded-tl-lg rounded-tr-lg')}
      >
        <FullToolbarPlugin />
      </div>
      <div
        ref={onRef}
        className={cn(
          wrapperContentEditableClassName,
          'relative min-h-110 px-3',
        )}
      >
        <ContentEditable className="ContentEditable__root ContentEditable__full" />
        {floatingAnchorElem && (
          <>
            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
            <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
          </>
        )}
      </div>
      <div
        className={cn(
          wrapperSelectionMonitorClassName,
          'rounded-br-lg rounded-bl-lg',
        )}
      >
        <SelectionMonitorPlugin />
      </div>
    </div>
  )
}

function MinimalEditorPlugins() {
  return (
    <>
      <CheckListRestrictionPlugin />
      <ListNumberValueNormalizerPlugin />
      <TransformPlugin />
    </>
  )
}

function FullEditorPlugins() {
  return (
    <>
      <CheckListRestrictionPlugin />
      <ListNumberValueNormalizerPlugin />
      <TablePlugin
        hasHorizontalScroll
        hasCellMerge
        hasNestedTables
        hasTabHandler
      />
      <TableCellActionMenuPlugin />
      <TableCellResizer />
      <TableScrollShadowPlugin />
      <TableFitNestedTablePlugin />
      <TableHoverActionsV2Plugin />
      <TableCellDeletePlugin />
      <BlockNodeEscapePlugin />
      <TransformPlugin />
      <CodeGutterPlugin />
    </>
  )
}

type EditorProps = {
  minimal?: boolean
  value?: EditorFieldValue
  onChange?: (value: EditorFieldValue) => void
  onBlur?: () => void
} & EditorExtensionProps
export function Editor({
  minimal,
  value,
  onChange,
  onBlur,
  ...editorProps
}: EditorProps) {
  const extension = minimal ? minimalExtension : fullExtension
  const Plugins = minimal ? MinimalEditorPlugins : FullEditorPlugins

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    onBlurRef.current = onBlur
  }, [onBlur])

  // Stabilize onChange so SyncPlugin never remounts
  const onChangeRef = useRef(onChange)

  const stableOnChange = useCallback((val: EditorFieldValue) => {
    onChangeRef.current?.(val)
  }, [])

  // Stabilize onBlur
  const onBlurRef = useRef(onBlur)

  const stableOnBlur = useCallback(() => {
    onBlurRef.current?.()
  }, [])

  return (
    <EditorStoreProvider initialValues={editorProps}>
      <div className="space-y-2">
        <ModalStoresProvider>
          <LexicalExtensionComposer extension={extension}>
            <Plugins />
            {onChange && <SyncPlugin value={value} onChange={stableOnChange} />}
            {onBlur && <BlurPlugin onBlur={stableOnBlur} />}

            {/* Add Event Listener */}
            {/* <NodeEventPlugin
          nodeType={TextNode}
          eventType={'click'}
          eventListener={(e: Event) => {
            alert('Nice!')
          }}
        /> */}

            {/* STANDBY For Debugging */}
            {/* <ExportPlugin /> */}
            {/* <TreeViewExtensionComponent /> */}
          </LexicalExtensionComposer>
        </ModalStoresProvider>
      </div>
    </EditorStoreProvider>
  )
}
