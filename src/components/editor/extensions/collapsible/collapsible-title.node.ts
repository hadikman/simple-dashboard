import {
  $createParagraphNode,
  $isElementNode,
  EditorConfig,
  ElementNode,
  IS_CHROME,
  IS_FIREFOX,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
} from 'lexical'

import { $isCollapsibleContainerNode } from './collapsible-container.node'
import { $isCollapsibleContentNode } from './collapsible-content.node'

/** @noInheritDoc */
export class CollapsibleTitleNode extends ElementNode {
  /** @internal */
  $config() {
    return this.config('collapsible-title', {
      $transform(node: CollapsibleTitleNode) {
        if (node.isEmpty()) {
          node.remove()
        }
      },
      extends: ElementNode,
    })
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('summary')
    dom.classList.add('collapsible__title')
    if (IS_CHROME || IS_FIREFOX) {
      dom.addEventListener('click', () => {
        editor.update(() => {
          const collapsibleContainer = this.getLatest().getParentOrThrow()
          if (!$isCollapsibleContainerNode(collapsibleContainer)) {
            throw new Error(
              'Expected parent node to be a CollapsibleContainerNode',
            )
          }
          collapsibleContainer.toggleOpen()
        })
      })
    }
    return dom
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    return false
  }

  insertNewAfter(_: RangeSelection, restoreSelection = true): ElementNode {
    const containerNode = this.getParentOrThrow()

    if (!$isCollapsibleContainerNode(containerNode)) {
      throw new Error(
        'CollapsibleTitleNode expects to be child of CollapsibleContainerNode',
      )
    }

    if (containerNode.getOpen()) {
      const contentNode = this.getNextSibling()
      if (!$isCollapsibleContentNode(contentNode)) {
        throw new Error(
          'CollapsibleTitleNode expects to have CollapsibleContentNode sibling',
        )
      }

      const firstChild = contentNode.getFirstChild()
      if ($isElementNode(firstChild)) {
        return firstChild
      } else {
        const paragraph = $createParagraphNode()
        contentNode.append(paragraph)
        return paragraph
      }
    } else {
      const paragraph = $createParagraphNode()
      containerNode.insertAfter(paragraph, restoreSelection)
      return paragraph
    }
  }
}

export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
  return new CollapsibleTitleNode()
}

export function $isCollapsibleTitleNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleTitleNode {
  return node instanceof CollapsibleTitleNode
}
