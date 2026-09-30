import {
  $createCodeNode,
  $isCodeNode,
  CodeIndentExtension,
} from '@lexical/code'
import {
  $generateHtmlFromNodes,
  $generateNodesFromDOM,
  $withRenderContext,
  contextValue,
} from '@lexical/html'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { IconHtml, IconMarkdown } from '@tabler/icons-react'
import { $createParagraphNode, $getRoot, $insertNodes, RootNode } from 'lexical'
import {
  startTransition,
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
} from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { getPeerDependencyFromEditor } from '@lexical/extension'

import { PagesExtension } from '../../extensions/pages'
import { RenderContextTerse } from '../../extensions/terse-export.extension'
import { formatCodeWithPrettier } from '../../utils/format-code-with-prettier'
import { PLAYGROUND_TRANSFORMERS } from '../markdown-transformers.plugin'

type EditorMode = 'wysiwyg' | 'markdown' | 'html'

// TODO Check table convertsion on html mode
// TODO Ask where is data-gutter

export function EditorMode() {
  const [editor] = useLexicalComposerContext()
  const unregisterTransformRef = useRef(() => {})
  const shouldPreserveNewLinesInMarkdown = true

  const [mode, dispatchMode, isPending] = useActionState(
    async (prevMode: EditorMode, nextMode: EditorMode): Promise<EditorMode> => {
      const pagesDisabled = getPeerDependencyFromEditor<typeof PagesExtension>(
        editor,
        PagesExtension.name,
      )?.output.disabled
      if (pagesDisabled !== undefined) {
        pagesDisabled.value = true
      }
      if (prevMode === 'wysiwyg') {
        // handle transitions from wysiwyg -> nextMode -> wysiwyg when there's a single
        // root child CodeNode that is the nextMode language. e2e tests assume you can
        // do this.
        editor.read(() => {
          const root = $getRoot()
          const codeNode =
            root.getChildrenSize() === 1
              ? root.getChildren().find($isCodeNode)
              : null
          if (codeNode) {
            const language = codeNode.getLanguage()
            if (language === nextMode) {
              prevMode = nextMode
              nextMode = 'wysiwyg'
            }
          }
        })
      }
      if (nextMode === 'wysiwyg') {
        unregisterTransformRef.current()
        editor.update(() => {
          if (prevMode === 'html') {
            const root = $getRoot()
            const parser = new DOMParser()
            const content = root.getTextContent()
            const dom = parser.parseFromString(content, 'text/html')
            // Lexicla Playground used $generateNodesFromDOMViaExtension(dom), so it didn't work for table conversion. I used $generateNodesFromDOM(editor,dom) to have table conversion
            const nodes = $generateNodesFromDOM(editor, dom)
            root.clear().select()
            $insertNodes(nodes)
            if (root.isEmpty()) {
              root.append($createParagraphNode()).select()
            }
          } else if (prevMode === 'markdown') {
            const root = $getRoot()
            const firstChild = root.getFirstChild()
            if (
              $isCodeNode(firstChild) &&
              firstChild.getLanguage() === 'markdown'
            ) {
              unregisterTransformRef.current()
              $convertFromMarkdownString(
                firstChild.getTextContent(),
                PLAYGROUND_TRANSFORMERS,
                undefined, // node
                shouldPreserveNewLinesInMarkdown,
              )
            }
          }
        })
      } else if (nextMode === 'markdown') {
        editor.update(() => {
          const markdown = $convertToMarkdownString(
            PLAYGROUND_TRANSFORMERS,
            undefined, //node
            shouldPreserveNewLinesInMarkdown,
          )
          const codeNode = $createCodeNode('markdown')
          $getRoot().clear().append(codeNode)
          codeNode.select().insertRawText(markdown)
          codeNode.select(0, 0)
        })
      } else if (nextMode === 'html') {
        const rawHtml = editor.read(() =>
          $withRenderContext(
            [contextValue(RenderContextTerse, true)],
            editor,
          )(() => $generateHtmlFromNodes(editor)),
        )
        const html = await formatCodeWithPrettier(rawHtml, 'html')
        editor.update(() => {
          const codeNode = $createCodeNode('html')
          $getRoot().clear().append(codeNode)
          codeNode.select().insertRawText(html.trimEnd())
          codeNode.select(0, 0)
        })
      }
      return nextMode
    },
    'wysiwyg',
  )

  useEffect(() => {
    const pagesDisabled = getPeerDependencyFromEditor<typeof PagesExtension>(
      editor,
      PagesExtension.name,
    )?.output.disabled
    const escapeWithArrows = getPeerDependencyFromEditor<
      typeof CodeIndentExtension
    >(editor, CodeIndentExtension.name)?.output.escapeWithArrows
    const isCodeBlockEditor = mode !== 'wysiwyg'
    if (pagesDisabled !== undefined) {
      pagesDisabled.value = isCodeBlockEditor
    }
    if (escapeWithArrows !== undefined) {
      escapeWithArrows.value = !isCodeBlockEditor
    }

    if (isCodeBlockEditor) {
      const unregister = editor.registerNodeTransform(RootNode, rootNode => {
        let codeNode = rootNode.getChildren().find($isCodeNode)
        if (!codeNode) {
          codeNode = $createCodeNode(mode)
        }
        if (rootNode.getChildrenSize() !== 1 || !codeNode.getParent()) {
          rootNode.splice(0, rootNode.getChildrenSize(), [codeNode])
          codeNode.select()
        }
        if (codeNode.getLanguage() !== mode) {
          codeNode.setLanguage(mode)
        }
      })
      unregisterTransformRef.current = unregister
      return unregister
    }
  }, [editor, mode])

  const [optimisticMode, setOptimisticMode] = useOptimistic<EditorMode>(mode)
  const isMarkdown = optimisticMode === 'markdown'
  const isHtml = optimisticMode === 'html'

  const toggleMode = (targetMode: 'html' | 'markdown') => {
    startTransition(() => {
      const nextMode =
        mode === 'wysiwyg' ? targetMode : mode === targetMode ? 'wysiwyg' : mode
      if (mode === nextMode) {
        return
      }
      setOptimisticMode(nextMode)
      dispatchMode(nextMode)
    })
  }

  return (
    <ButtonGroup>
      <Button
        size="icon"
        variant="outline"
        data-active={isMarkdown}
        title={isMarkdown ? 'Convert From Markdown' : 'Convert To Markdown'}
        disabled={isHtml || isPending}
        onClick={() => toggleMode('markdown')}
      >
        <IconMarkdown />
      </Button>
      <Button
        size="icon"
        variant="outline"
        data-active={isHtml}
        title={isHtml ? 'Convert From HTML' : ' Convert To HTML'}
        disabled={isMarkdown || isPending}
        onClick={() => toggleMode('html')}
      >
        <IconHtml />
      </Button>
    </ButtonGroup>
  )
}
