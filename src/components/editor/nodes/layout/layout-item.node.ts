import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  SerializedElementNode,
} from 'lexical'

import { addClassNamesToElement } from '@lexical/utils'
import { $isParagraphNode, ElementNode } from 'lexical'

export type SerializedLayoutItemNode = SerializedElementNode

export function $isEmptyLayoutItemNode(node: LexicalNode): boolean {
  if (!$isLayoutItemNode(node) || node.getChildrenSize() !== 1) {
    return false
  }
  const firstChild = node.getFirstChild()
  return $isParagraphNode(firstChild) && firstChild.isEmpty()
}

export class LayoutItemNode extends ElementNode {
  static getType(): string {
    return 'layout-item'
  }

  static clone(node: LayoutItemNode): LayoutItemNode {
    return new LayoutItemNode(node.__key)
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (
          !domNode.hasAttribute('data-lexical-layout-item') &&
          !domNode.classList.contains('layoutItem')
        ) {
          return null
        }
        return {
          conversion: () => ({ node: $createLayoutItemNode() }),
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const dom = document.createElement('div')
    dom.setAttribute('data-lexical-layout-item', 'true')
    return { element: dom }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div')
    dom.setAttribute('data-lexical-layout-item', 'true')
    if (typeof config.theme.layoutItem === 'string') {
      addClassNamesToElement(dom, config.theme.layoutItem)
    }
    return dom
  }

  updateDOM(): boolean {
    return false
  }

  collapseAtStart(): boolean {
    const parent = this.getParentOrThrow()
    if (
      this.is(parent.getFirstChild()) &&
      parent.getChildren().every($isEmptyLayoutItemNode)
    ) {
      parent.remove()
      return true
    }
    return false
  }

  static importJSON(serializedNode: SerializedLayoutItemNode): LayoutItemNode {
    return $createLayoutItemNode().updateFromJSON(serializedNode)
  }

  isShadowRoot(): boolean {
    return true
  }
}

export function $createLayoutItemNode(): LayoutItemNode {
  return new LayoutItemNode()
}

export function $isLayoutItemNode(
  node: LexicalNode | null | undefined,
): node is LayoutItemNode {
  return node instanceof LayoutItemNode
}
