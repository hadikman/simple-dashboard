import type { JSX } from 'react'

import './page-break.node.css'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import {
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  DOMConversionMap,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical'
import { useEffect } from 'react'

export type SerializedPageBreakNode = SerializedLexicalNode

function PageBreakComponent({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey)

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const pbElem = editor.getElementByKey(nodeKey)

          if (event.target === pbElem) {
            if (!event.shiftKey) {
              clearSelection()
            }
            setSelected(!isSelected)
            return true
          }

          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [clearSelection, editor, isSelected, nodeKey, setSelected])

  useEffect(() => {
    const pbElem = editor.getElementByKey(nodeKey)
    if (pbElem !== null) {
      pbElem.className = isSelected ? 'selected' : ''
    }
  }, [editor, isSelected, nodeKey])

  return null
}

export class PageBreakNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'page-break'
  }

  static clone(node: PageBreakNode): PageBreakNode {
    return new PageBreakNode(node.__key)
  }

  static importJSON(serializedNode: SerializedPageBreakNode): PageBreakNode {
    return $createPageBreakNode().updateFromJSON(serializedNode)
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: (domNode: HTMLElement) => {
        if (domNode.hasAttribute('data-lexical-page-break')) {
          return {
            conversion: () => ({ node: $createPageBreakNode() }),
            priority: 2,
          }
        }
        return null
      },
      figure: (domNode: HTMLElement) => {
        if (domNode.getAttribute('type') === 'page-break') {
          return {
            conversion: () => ({ node: $createPageBreakNode() }),
            priority: 2,
          }
        }
        return null
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('hr')
    el.style.pageBreakAfter = 'always'
    el.setAttribute('data-lexical-page-break', 'true')
    return { element: el }
  }

  createDOM(): HTMLElement {
    const el = document.createElement('hr')
    el.style.pageBreakAfter = 'always'
    el.setAttribute('data-lexical-page-break', 'true')
    return el
  }

  getTextContent(): string {
    return '\n'
  }

  isInline(): false {
    return false
  }

  updateDOM(): boolean {
    return false
  }

  decorate(): JSX.Element {
    return <PageBreakComponent nodeKey={this.__key} />
  }
}

export function $createPageBreakNode(): PageBreakNode {
  return new PageBreakNode()
}

export function $isPageBreakNode(
  node: LexicalNode | null | undefined,
): node is PageBreakNode {
  return node instanceof PageBreakNode
}
