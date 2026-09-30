import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TreeView } from '@lexical/react/LexicalTreeView'
import { ReactExtension } from '@lexical/react/ReactExtension'
import { useExtensionDependency } from '@lexical/react/useExtensionComponent'
import { defineExtension } from 'lexical'

export type TreeViewConfig = Omit<Parameters<typeof TreeView>[0], 'editor'>
export function TreeViewExtensionComponent(props: Partial<TreeViewConfig>) {
  const [editor] = useLexicalComposerContext()

  return (
    <TreeView
      editor={editor}
      {...useExtensionDependency(TreeViewExtension).config}
      {...props}
    />
  )
}

const config: TreeViewConfig = {
  timeTravelButtonClassName: 'debug-timetravel-button',
  timeTravelPanelButtonClassName: 'debug-timetravel-panel-button',
  timeTravelPanelClassName: 'debug-timetravel-panel',
  timeTravelPanelSliderClassName: 'debug-timetravel-panel-slider',
  treeTypeButtonClassName: 'debug-treetype-button',
  viewClassName: 'tree-view-output',
}

export const TreeViewExtension = defineExtension({
  build: () => ({ Component: TreeViewExtensionComponent }),
  config,
  dependencies: [ReactExtension],
  name: '@lexical/react/TreeView',
})
