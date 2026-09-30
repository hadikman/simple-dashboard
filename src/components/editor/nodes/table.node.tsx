import { TableNode, type SerializedTableNode } from '@lexical/table'
import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  LexicalEditor,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type Spread,
} from 'lexical'

export type SerializedCustomTableNode = Spread<
  { fullWidth: boolean },
  SerializedTableNode
>

export class CustomTableNode extends TableNode {
  __fullWidth: boolean

  static getType(): string {
    return 'custom-table'
  }

  static clone(node: CustomTableNode): CustomTableNode {
    return new CustomTableNode(node.__fullWidth, node.__key)
  }

  constructor(fullWidth: boolean = false, key?: NodeKey) {
    super(key)
    this.__fullWidth = fullWidth
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config)

    // TableNode usually returns the <table> itself, not a wrapper.
    const table = dom.tagName === 'TABLE' ? dom : dom.querySelector('table')

    if (table && this.__fullWidth) {
      table.classList.add('table-full-width')
    }

    return dom
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const updated = super.updateDOM(prevNode, dom, config)

    if (prevNode.__fullWidth !== this.__fullWidth) {
      const table = dom.tagName === 'TABLE' ? dom : dom.querySelector('table')

      if (table) {
        if (this.__fullWidth) {
          table.classList.add('table-full-width')
        } else {
          table.classList.remove('table-full-width')
        }
      }
    }

    return updated
  }

  static importDOM(): DOMConversionMap | null {
    const parentImportDOM = TableNode.importDOM?.() ?? {}

    return {
      ...parentImportDOM,
      table: () => ({
        conversion: convertCustomTableElement,
        priority: 1,
      }),
    }
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const result = super.exportDOM(editor)
    if (!result.element) return result

    const element = result.element as HTMLElement
    const table =
      element.tagName === 'TABLE' ? element : element.querySelector('table')

    if (table) {
      table.setAttribute('data-custom-table', 'true')

      if (this.__fullWidth) {
        table.classList.add('table-full-width')
        table.setAttribute('data-full-width', 'true')
      } else {
        table.removeAttribute('data-full-width')
      }
    }

    return result
  }

  static importJSON(
    serializedNode: SerializedCustomTableNode,
  ): CustomTableNode {
    const node = TableNode.importJSON(serializedNode) as CustomTableNode
    node.setFullWidth(serializedNode.fullWidth ?? false)
    return node
  }

  exportJSON(): SerializedCustomTableNode {
    return {
      ...super.exportJSON(),
      fullWidth: this.__fullWidth,
      type: 'custom-table',
      version: 1,
    }
  }

  getFullWidth(): boolean {
    return this.getLatest().__fullWidth
  }

  setFullWidth(fullWidth: boolean): this {
    const writable = this.getWritable()
    writable.__fullWidth = fullWidth
    return writable
  }
}

function convertCustomTableElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  // 1. Get the native conversion output from standard TableNode.
  // This step is critical because standard TableNode contains `after` and `forChild`
  // mapping rules to safely traverse <tbody> and <thead> without destroying structure.
  const parentImportMap = TableNode.importDOM()
  const parentTableConverter = parentImportMap?.table?.(domNode)

  let parentOutput: DOMConversionOutput | null = null
  if (parentTableConverter && parentTableConverter.conversion) {
    parentOutput = parentTableConverter.conversion(domNode)
  }

  // 2. Initialize our custom node.
  const fullWidth = domNode.hasAttribute('data-full-width')
  const customNode = $createCustomTableNode()
  customNode.setFullWidth(fullWidth)

  // 3. Merge custom node with native parsing hooks.
  if (parentOutput) {
    return {
      ...parentOutput,
      node: customNode,
    }
  }

  return { node: customNode }
}

export function $createCustomTableNode(): CustomTableNode {
  return $applyNodeReplacement(new CustomTableNode())
}

export function $isCustomTableNode(
  node: LexicalNode | null | undefined,
): node is CustomTableNode {
  return node instanceof CustomTableNode
}
