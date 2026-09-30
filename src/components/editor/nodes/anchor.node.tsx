import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'

export type SerializedAnchorNode = Spread<
  {
    anchorId: string
  },
  SerializedElementNode
>

export class AnchorNode extends ElementNode {
  __anchorId: string

  static getType(): string {
    return 'anchor'
  }

  static clone(node: AnchorNode): AnchorNode {
    return new AnchorNode(node.__anchorId, node.__key)
  }

  constructor(anchorId: string, key?: NodeKey) {
    super(key)
    this.__anchorId = anchorId
  }

  // ---- Serialization ----
  exportJSON(): SerializedAnchorNode {
    return {
      ...super.exportJSON(),
      anchorId: this.__anchorId,
      type: 'anchor',
      version: 1,
    }
  }

  static importJSON(serializedNode: SerializedAnchorNode): AnchorNode {
    const node = $createAnchorNode(serializedNode.anchorId)
    return node
  }

  // ---- DOM rendering ----
  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('span')
    element.id = this.__anchorId
    element.className = 'anchor' // optional styling
    return element
  }

  updateDOM(
    prevNode: AnchorNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    if (prevNode.__anchorId !== this.__anchorId) {
      dom.id = this.__anchorId
    }
    // Returning false tells Lexical we handled the update, no need to replace the DOM
    return false
  }

  // ---- Import from HTML (when pasting) ----
  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        const id = domNode.getAttribute('id')
        if (!id || !id.startsWith('anchor-')) {
          return null
        }
        return {
          conversion: element => {
            const node = $createAnchorNode(id)
            return { node }
          },
          priority: 1,
        }
      },
    }
  }

  // ---- Export to HTML (when copying) ----
  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.id = this.__anchorId
    element.textContent = this.getTextContent()
    return { element }
  }

  // Unique identifier for each anchor – useful for toolbar detection
  getAnchorId(): string {
    return this.__anchorId
  }

  // Make this node INLINE (like a link, not a paragraph)
  isInline(): boolean {
    return true // anchors are block-level? You can change to true if you want inline
  }

  // Don't add dir attribute
  isShadowRoot(): boolean {
    return false
  }

  canBeEmpty(): boolean {
    return false
  }

  // Allow this node to be a child of paragraphs and other inline containers
  canInsertTextBefore(): boolean {
    return false
  }

  canInsertTextAfter(): boolean {
    return false
  }

  canMergeWhenEmpty(): boolean {
    return false
  }
}

export function $createAnchorNode(anchorId: string): AnchorNode {
  return $applyNodeReplacement(new AnchorNode(anchorId))
}

export function $isAnchorNode(
  node: LexicalNode | null | undefined,
): node is AnchorNode {
  return node instanceof AnchorNode
}
