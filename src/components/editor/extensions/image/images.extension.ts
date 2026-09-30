import {
  $generateNodesFromDOM,
  defineImportRule,
  DOMImportExtension,
  sel,
} from '@lexical/html'
import {
  $isAutoLinkNode,
  $isLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link'
import {
  $findMatchingParent,
  $wrapNodeInElement,
  mergeRegister,
} from '@lexical/utils'
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $selectAll,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  configExtension,
  createCommand,
  defineExtension,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  getDOMSelectionFromTarget,
  isHTMLElement,
  LexicalCommand,
  LexicalEditor,
  SKIP_DOM_SELECTION_TAG,
} from 'lexical'

import {
  $createImageNode,
  $isImageNode,
  ImageNode,
  ImageNodeAlignment,
  ImageNodeType,
  ImagePayload,
} from '../../nodes/image/image.node'

/**
 * Google Docs serializes its bullet/check list markers as a leading
 * `<img>` carrying `aria-roledescription="checkbox"`. We never want to
 * import those as ImageNodes — that yields a stray bullet image in the
 * editor where the list marker should be.
 */
function isGoogleDocCheckboxImg(img: HTMLImageElement): boolean {
  return (
    img.parentElement != null &&
    img.parentElement.tagName === 'LI' &&
    img.previousSibling === null &&
    img.getAttribute('aria-roledescription') === 'checkbox'
  )
}

const ImgRule = defineImportRule({
  $import: (_ctx, el, $next) => {
    const src = el.getAttribute('src')
    if (!src || isGoogleDocCheckboxImg(el)) {
      return $next()
    }

    const type = (el.getAttribute('data-type') as ImageNodeType) || 'url'
    const alignAttr = el.getAttribute('data-align') as ImageNodeAlignment

    return [
      $createImageNode({
        src,
        altText: el.alt || '',
        imageType: type,
        height: el.height,
        width: el.width,
        alignment: alignAttr,
      }),
    ]
  },
  match: sel.tag('img'),
  name: '@lexical/img',
})

/**
 * `<figcaption>` is consumed by the surrounding `<figure>` rule (its
 * content is imported into the ImageNode's nested caption editor), so a
 * top-level handler drops it entirely.
 */
const FigcaptionRule = defineImportRule({
  $import: () => [],
  match: sel.tag('figcaption'),
  name: '@lexical/figcaption',
})

const FigureRule = defineImportRule({
  $import: (ctx, el) => {
    const imported = ctx.$importChildren(el)
    const figcaption = el.querySelector('figcaption')
    if (figcaption) {
      for (const imgNode of imported) {
        if (!$isImageNode(imgNode)) {
          continue
        }
        imgNode.setShowCaption(true)
        // The caption editor is a nested editor with its own (legacy)
        // import pipeline; route the <figcaption> children through it.
        imgNode.__caption.update(
          () => {
            $selectAll().insertNodes(
              $generateNodesFromDOM(imgNode.__caption, figcaption),
            )
            $setSelection(null)
          },
          { tag: SKIP_DOM_SELECTION_TAG },
        )
      }
    }
    return imported
  },
  match: sel.tag('figure'),
  name: '@lexical/figure',
})

export type InsertImagePayload = Readonly<ImagePayload>

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND')

export const ImagesExtension = defineExtension({
  dependencies: [
    configExtension(DOMImportExtension, {
      rules: [FigcaptionRule, FigureRule, ImgRule],
    }),
  ],
  name: '@lexical/Images',
  nodes: [ImageNode],
  register: editor =>
    mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        payload => {
          const imageNode = $createImageNode(payload)
          $insertNodes([imageNode])
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
          }
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        event => $onDragStart(event),
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        event => $onDragover(event),
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        event => $onDrop(event, editor),
        COMMAND_PRIORITY_HIGH,
      ),
    ),
})

const TRANSPARENT_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

let dragImage: HTMLImageElement | null = null
function getDragImage(): HTMLImageElement {
  if (!dragImage) {
    dragImage = document.createElement('img')
    dragImage.src = TRANSPARENT_IMAGE
  }
  return dragImage
}

function $onDragStart(event: DragEvent): boolean {
  const node = $getImageNodeInSelection()
  if (!node) {
    return false
  }
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) {
    return false
  }
  dataTransfer.setData('text/plain', '_')
  dataTransfer.setDragImage(getDragImage(), 0, 0)
  dataTransfer.setData(
    'application/x-lexical-drag',
    JSON.stringify({
      data: {
        altText: node.__altText,
        type: node.__type,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: 'image',
    }),
  )

  return true
}

function $onDragover(event: DragEvent): boolean {
  const dataTransfer = event.dataTransfer

  // Block external file drops — show forbidden cursor
  if (dataTransfer?.types.includes('Files')) {
    event.preventDefault()
    dataTransfer.dropEffect = 'none'
    return true
  }
  // STANDBY
  // Allow external file drops
  // if (dataTransfer?.types.includes('Files') && canDropImage(event)) {
  //   event.preventDefault()
  //   return true
  // }

  // Block invalid drop targets for internal image drag
  const node = $getImageNodeInSelection()
  if (node && !canDropImage(event)) {
    event.preventDefault()
  }

  return false
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  // Handle internal image drag
  const node = $getImageNodeInSelection()
  const data = getDragImageData(event)

  if (node && data) {
    const existingLink = $findMatchingParent(
      node,
      (parent): parent is LinkNode =>
        !$isAutoLinkNode(parent) && $isLinkNode(parent),
    )
    event.preventDefault()
    if (canDropImage(event)) {
      const range = getDragSelection(event)
      node.remove()
      const rangeSelection = $createRangeSelection()
      if (range !== null && range !== undefined) {
        rangeSelection.applyDOMRange(range)
      }
      $setSelection(rangeSelection)
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, data)
      if (existingLink) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, existingLink.getURL())
      }
    }
    return true
  }

  // STANDBY
  // Handle external file drop
  // const files = event.dataTransfer?.files
  // if (files && files.length > 0) {
  //   const imageFiles = Array.from(files).filter(file =>
  //     file.type.startsWith('image/'),
  //   )

  //   if (imageFiles.length === 0) return false

  //   event.preventDefault()

  //   // Set selection at drop position
  //   if (canDropImage(event)) {
  //     const range = getDragSelection(event)
  //     if (range) {
  //       const rangeSelection = $createRangeSelection()
  //       rangeSelection.applyDOMRange(range)
  //       $setSelection(rangeSelection)
  //     }
  //   }

  //   // Read and insert each image file
  //   for (const file of imageFiles) {
  //     const reader = new FileReader()
  //     reader.onload = () => {
  //       const src = reader.result as string
  //       editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
  //         src,
  //         altText: file.name,
  //         imageType: 'file',
  //       })
  //     }
  //     reader.readAsDataURL(file)
  //   }

  //   return true
  // }

  return false
}

function $getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection()
  if (!$isNodeSelection(selection)) {
    return null
  }
  const nodes = selection.getNodes()
  const node = nodes[0]
  return $isImageNode(node) ? node : null
}

function getDragImageData(
  event: DragEvent,
): (InsertImagePayload & { key?: string }) | null {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag')
  if (!dragData) {
    return null
  }
  const { type, data } = JSON.parse(dragData)
  if (type !== 'image') {
    return null
  }

  return data
}

declare global {
  interface DragEvent {
    rangeOffset?: number
    rangeParent?: Node
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target
  return !!(
    isHTMLElement(target) &&
    !target.closest('code, span.editor-image') &&
    isHTMLElement(target.parentElement) &&
    target.parentElement.closest('div.ContentEditable__root')
  )
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range
  const domSelection = getDOMSelectionFromTarget(event.target)
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY)
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0)
    range = domSelection.getRangeAt(0)
  } else {
    throw Error(`Cannot get the selection when dragging`)
  }

  return range
}
