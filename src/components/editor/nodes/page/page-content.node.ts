import type { LexicalNode } from 'lexical'

import { getExtensionDependencyFromEditor } from '@lexical/extension'
import {
  $create,
  $getEditor,
  addClassNamesToElement,
  ElementNode,
} from 'lexical'

import { PagesExtension } from '../../extensions/pages'
import { $isPageNode, PageNode } from './page.node'

export class PageContentNode extends ElementNode {
  $config() {
    return this.config('page-content', {
      extends: ElementNode,
    })
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('div')
    addClassNamesToElement(
      dom,
      getExtensionDependencyFromEditor($getEditor(), PagesExtension).config
        .pageContentClass,
    )
    return dom
  }

  updateDOM(): boolean {
    return false
  }

  getPageNode(): PageNode {
    const parent = this.getParent()
    if (!$isPageNode(parent))
      throw new Error('PageContentNode: Parent is not a PageNode')
    return parent
  }

  isShadowRoot(): boolean {
    return true
  }

  excludeFromCopy(): boolean {
    return true
  }

  canInsertTextBefore(): boolean {
    return false
  }

  canInsertTextAfter(): boolean {
    return false
  }

  canBeEmpty(): boolean {
    return false
  }
}

export function $createPageContentNode(): PageContentNode {
  return $create(PageContentNode)
}

export function $isPageContentNode(
  node: LexicalNode | null | undefined,
): node is PageContentNode {
  return node instanceof PageContentNode
}
