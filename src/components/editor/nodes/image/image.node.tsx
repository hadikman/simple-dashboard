import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditorWithDispose,
  LexicalNode,
  LexicalUpdateJSON,
  NodeKey,
  RangeSelection,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import type { JSX } from 'react'

import { buildEditorFromExtensions } from '@lexical/extension'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import {
  $applyNodeReplacement,
  $createRangeSelection,
  $extendCaretToRange,
  $getChildCaret,
  $getRoot,
  $isElementNode,
  $isParagraphNode,
  DecoratorNode,
} from 'lexical'
import React from 'react'

import { ImageCaptionEditorExtension } from '../../extensions/image/image-caption-editor.extension'

const ImageComponent = React.lazy(() =>
  import('../../components/image.component').then(module => ({
    default: module.ImageComponent,
  })),
)
export type ImageNodeType = 'file' | 'url'
export type ImageNodeAlignment = 'left' | 'middle' | 'right'
export interface ImagePayload {
  altText: string
  caption?: LexicalEditorWithDispose
  height?: number
  key?: NodeKey
  showCaption?: boolean
  src: string
  imageType: ImageNodeType
  width?: number
  alignment?: ImageNodeAlignment
  captionsEnabled?: boolean
}

export function $isCaptionEditorEmpty(): boolean {
  // Search the document for any non-element node
  // to determine if it's empty or not
  for (const { origin } of $extendCaretToRange(
    $getChildCaret($getRoot(), 'next'),
  )) {
    if (!$isElementNode(origin)) {
      return false
    }
  }
  return true
}

export type SerializedImageNode = Spread<
  {
    alignment?: ImageNodeAlignment
    altText: string
    caption: SerializedEditor
    height?: number
    showCaption: boolean
    src: string
    imageType: ImageNodeType
    width?: number
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __imageType: ImageNodeType
  __width: 'inherit' | number
  __height: 'inherit' | number
  __showCaption: boolean
  __caption: LexicalEditorWithDispose
  __alignment: ImageNodeAlignment | undefined
  // Captions cannot yet be used within editor cells
  __captionsEnabled: boolean

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__imageType,
      node.__width,
      node.__height,
      node.__alignment,
      node.__showCaption,
      node.__caption,
      node.__captionsEnabled,
      node.__key,
    )
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
      figure: () => ({
        conversion: convertFigureElement,
        priority: 1,
      }),
    }
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, src, showCaption, imageType, alignment } =
      serializedNode
    return $createImageNode({
      altText,
      height,
      showCaption,
      src,
      imageType,
      alignment,
      width,
    }).updateFromJSON(serializedNode)
  }

  updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedImageNode>): this {
    const node = super.updateFromJSON(serializedNode)
    const { caption } = serializedNode

    const nestedEditor = node.__caption
    const editorState = nestedEditor.parseEditorState(caption.editorState)
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState)
    }
    return node
  }

  exportDOM(): DOMExportOutput {
    const imgElement = document.createElement('img')
    imgElement.setAttribute('src', this.__src)
    imgElement.setAttribute('alt', this.__altText)
    imgElement.setAttribute('data-type', this.__imageType)
    imgElement.setAttribute('width', this.__width.toString())
    imgElement.setAttribute('height', this.__height.toString())

    if (this.__alignment)
      imgElement.setAttribute('data-align', this.__alignment)

    if (this.__showCaption && this.__caption) {
      const captionEditor = this.__caption
      const captionHtml = captionEditor.read(() => {
        if ($isCaptionEditorEmpty()) {
          return null
        }
        // Don't serialize the wrapping paragraph if there is only one
        let selection: null | RangeSelection = null
        const firstChild = $getRoot().getFirstChild()
        if (
          $isParagraphNode(firstChild) &&
          firstChild.getNextSibling() === null
        ) {
          selection = $createRangeSelection()
          selection.anchor.set(firstChild.getKey(), 0, 'element')
          selection.focus.set(
            firstChild.getKey(),
            firstChild.getChildrenSize(),
            'element',
          )
        }
        return $generateHtmlFromNodes(captionEditor, selection)
      })
      if (captionHtml) {
        const figureElement = document.createElement('figure')
        const figcaptionElement = document.createElement('figcaption')
        figcaptionElement.innerHTML = captionHtml

        if (this.__alignment)
          figureElement.setAttribute('data-align', this.__alignment)

        figureElement.appendChild(imgElement)
        figureElement.appendChild(figcaptionElement)

        return { element: figureElement }
      }
    }

    return { element: imgElement }
  }

  constructor(
    src: string,
    altText: string,
    imageType: ImageNodeType,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    alignment?: ImageNodeAlignment,
    showCaption?: boolean,
    caption?: LexicalEditorWithDispose,
    captionsEnabled?: boolean,
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__imageType = imageType
    this.__width = width || 'inherit'
    this.__height = height || 'inherit'
    this.__alignment = alignment
    this.__showCaption = showCaption || false
    this.__caption =
      caption || buildEditorFromExtensions(ImageCaptionEditorExtension)
    this.__captionsEnabled = captionsEnabled !== false
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      imageType: this.__imageType,
      width: this.__width === 'inherit' ? 0 : this.__width,
      alignment: this.__alignment,
    }
  }

  setWidthAndHeight(
    width: 'inherit' | number,
    height: 'inherit' | number,
  ): this {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
    return writable
  }

  setShowCaption(showCaption: boolean): this {
    const writable = this.getWritable()
    writable.__showCaption = showCaption
    return writable
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    const theme = config.theme
    const className = theme.image
    if (className !== undefined) {
      span.className = className
    }

    if (this.__alignment) span.setAttribute('data-align', this.__alignment)

    return span
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    // Check if alignment changed
    if (prevNode.__alignment !== this.__alignment) {
      if (this.__alignment) {
        dom.setAttribute('data-align', this.__alignment)
      } else {
        dom.removeAttribute('data-align')
      }
    }

    return false
  }

  getSrc(): string {
    return this.getLatest().__src
  }

  getAltText(): string {
    return this.getLatest().__altText
  }

  getImageType(): ImageNodeType {
    return this.getLatest().__imageType
  }

  getAlignment(): ImageNodeAlignment | undefined {
    return this.getLatest().__alignment
  }

  $update(payload: Partial<ImagePayload>): this {
    const writable = this.getWritable()

    if (payload.src !== undefined) writable.__src = payload.src
    if (payload.altText !== undefined) writable.__altText = payload.altText
    if (payload.alignment !== undefined) {
      writable.__alignment = payload.alignment
    }

    if (payload.width !== undefined) writable.__width = payload.width
    if (payload.height !== undefined) writable.__height = payload.height
    if (payload.showCaption !== undefined)
      writable.__showCaption = payload.showCaption
    if (payload.captionsEnabled !== undefined)
      writable.__captionsEnabled = payload.captionsEnabled

    return writable
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        imageType={this.__imageType}
        width={this.__width}
        height={this.__height}
        nodeKey={this.getKey()}
        showCaption={this.__showCaption}
        caption={this.__caption}
        captionsEnabled={this.__captionsEnabled}
        resizable={true}
      />
    )
  }

  isInline(): boolean {
    return false
  }
}

export function $createImageNode({
  altText,
  height,
  imageType,
  captionsEnabled,
  src,
  width,
  alignment,
  showCaption,
  caption,
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(
      src,
      altText,
      imageType,
      width,
      height,
      alignment,
      showCaption,
      caption,
      captionsEnabled,
      key,
    ),
  )
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode
}

function convertImageElement(domNode: HTMLElement): DOMConversionOutput | null {
  const img = domNode as HTMLImageElement
  const src = img.getAttribute('src')
  if (!src) return null

  const altText = img.getAttribute('alt') || ''
  const typeAttr = (img.getAttribute('data-type') as ImageNodeType) || ''
  const alignAttr = img.getAttribute('data-align') as ImageNodeAlignment

  const widthAttr = img.getAttribute('width')
  const heightAttr = img.getAttribute('height')

  const width = widthAttr ? parseInt(widthAttr, 10) : undefined
  const height = heightAttr ? parseInt(heightAttr, 10) : undefined

  const node = $createImageNode({
    src,
    altText,
    imageType: typeAttr,
    width: width || undefined,
    height: height || undefined,
    alignment: alignAttr || undefined,
    showCaption: false,
  })

  return { node }
}

function convertFigureElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  const figure = domNode as HTMLElement
  const img = figure.querySelector('img')
  if (!img) return null

  const src = img.getAttribute('src')
  if (!src) return null

  const altText = img.getAttribute('alt') || ''
  const typeAttr = (img.getAttribute('data-type') as ImageNodeType) || ''
  const alignAttr = (img.getAttribute('data-align') ||
    figure.getAttribute('data-align')) as ImageNodeAlignment

  const widthAttr = img.getAttribute('width')
  const heightAttr = img.getAttribute('height')

  const width = widthAttr ? parseInt(widthAttr, 10) : undefined
  const height = heightAttr ? parseInt(heightAttr, 10) : undefined

  // Check for caption
  const figcaption = figure.querySelector('figcaption')
  let showCaption = false
  let caption: LexicalEditorWithDispose | undefined

  if (figcaption && figcaption.textContent?.trim()) {
    showCaption = true
    caption = buildEditorFromExtensions(ImageCaptionEditorExtension)

    const captionHtml = figcaption.innerHTML
    caption.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(captionHtml, 'text/html')
      const nodes = $generateNodesFromDOM(caption!, dom)
      const root = $getRoot()
      root.clear()
      root.append(...nodes)
    })
  }

  const node = $createImageNode({
    src,
    altText,
    imageType: typeAttr,
    width: width || undefined,
    height: height || undefined,
    alignment: alignAttr || undefined,
    showCaption,
    caption,
  })

  return { node }
}
