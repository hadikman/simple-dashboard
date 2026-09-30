import {
  $generateHtmlFromNodes,
  $generateNodesFromDOM,
  $withRenderContext,
  contextValue,
} from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $getRoot, $setSelection, type EditorState } from 'lexical'
import { useEffect, useRef } from 'react'
import { RenderContextTerse } from '../extensions/terse-export.extension'

export type EditorFieldValue = {
  json: Record<string, unknown> | null
  html: string
  text: string
}

export const EMPTY_EDITOR_VALUE: EditorFieldValue = {
  json: null,
  html: '',
  text: '',
}

type SyncPluginProps = {
  value?: EditorFieldValue
  onChange: (value: EditorFieldValue) => void
}

export function SyncPlugin({ value, onChange }: SyncPluginProps) {
  const [editor] = useLexicalComposerContext()
  const isExternalUpdate = useRef(false)
  const hasHydrated = useRef(false)

  // Hydrate editor from initial JSON or HTML value (once)
  useEffect(() => {
    if (hasHydrated.current || !value) return

    const { json, html } = value

    if (isValidLexicalState(json)) {
      try {
        isExternalUpdate.current = true
        const editorState = editor.parseEditorState(JSON.stringify(json))
        editor.setEditorState(editorState)
        hasHydrated.current = true
        return
      } catch (error) {
        console.error('Failed to parse Lexical editor state:', error)
      }
    }

    if (html?.trim()) {
      isExternalUpdate.current = true
      editor.update(
        () => {
          const parser = new DOMParser()
          const dom = parser.parseFromString(html, 'text/html')
          const nodes = $generateNodesFromDOM(editor, dom)
          const root = $getRoot()
          root.clear()
          root.append(...nodes)
          $setSelection(null)
        },
        { tag: 'history-merge' },
      )
      hasHydrated.current = true
      return
    }

    hasHydrated.current = true
  }, [editor, value])

  function handleChange(editorState: EditorState) {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false
      return
    }

    const json = editorState.toJSON() as unknown as Record<string, unknown>

    const html = editorState.read(() =>
      $withRenderContext(
        [contextValue(RenderContextTerse, true)],
        editor,
      )(() => $generateHtmlFromNodes(editor)),
    )

    const text = editorState.read(() => $getRoot().getTextContent())

    onChange({ json, html, text })
  }

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
}

function isValidLexicalState(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const root = (value as { root?: unknown }).root
  if (!root || typeof root !== 'object' || Array.isArray(root)) return false

  return (root as { type?: unknown }).type === 'root'
}
