import {
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  IS_CHROME,
  IS_FIREFOX,
  LexicalEditor,
  LexicalNode,
} from 'lexical'

import { $isCollapsibleContainerNode } from './collapsible-container.node'
import { domOnBeforeMatch, setDomHiddenUntilFound } from './collapsible-utils'

export class CollapsibleContentNode extends ElementNode {
  $config() {
    return this.config('collapsible-content', { extends: ElementNode })
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('div')
    dom.classList.add('collapsible__content')
    if (IS_CHROME || IS_FIREFOX) {
      editor.read('latest', () => {
        const containerNode = this.getParentOrThrow()
        if (!$isCollapsibleContainerNode(containerNode)) {
          throw new Error(
            'Expected parent node to be a CollapsibleContainerNode',
          )
        }
        if (!containerNode.getOpen()) {
          setDomHiddenUntilFound(dom)
        }
      })
      domOnBeforeMatch(dom, () => {
        editor.update(() => {
          const containerNode = this.getParentOrThrow().getLatest()
          if (!$isCollapsibleContainerNode(containerNode)) {
            throw new Error(
              'Expected parent node to be a CollapsibleContainerNode',
            )
          }
          if (!containerNode.getOpen()) {
            containerNode.toggleOpen()
          }
        })
      })
    }
    return dom
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    return false
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.classList.add('collapsible__content')
    element.setAttribute('data-lexical-collapsible-content', 'true')
    return { element }
  }

  isShadowRoot(): boolean {
    return true
  }
}

export function $createCollapsibleContentNode(): CollapsibleContentNode {
  return new CollapsibleContentNode()
}

export function $isCollapsibleContentNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleContentNode {
  return node instanceof CollapsibleContentNode
}
