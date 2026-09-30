import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import React from 'react'

export function ExportPlugin() {
  const [editor] = useLexicalComposerContext()
  const [viewMode, setViewMode] = React.useState<
    'none' | 'html' | 'json' | 'text'
  >('none')
  const [output, setOutput] = React.useState('')

  const showHTML = async () => {
    const element = editor.getRootElement()
    if (element) {
      const html = element.innerHTML
      const formattedHTML = formatHTML(html)

      setOutput(formattedHTML)
      setViewMode('html')
    }
  }

  const showJSON = () => {
    editor.getEditorState().read(() => {
      const jsonState = editor.getEditorState().toJSON()
      setOutput(JSON.stringify(jsonState, null, 2))
      setViewMode('json')
    })
  }

  const showText = () => {
    const element = editor.getRootElement()
    if (element) {
      setOutput(element.textContent || '')
      setViewMode('text')
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault()

        const editorElement = editor.getRootElement()
        if (editorElement) {
          const rawHTML = editorElement.innerHTML
          console.log('=== RAW EDITOR HTML ===')
          console.log(rawHTML)

          // Also show it in a formatted way
          console.log('=== FORMATTED RAW HTML ===')
          const formatted = formatHTML(rawHTML)
          console.log(formatted)
        }

        // Method 2: Get JSON state (most reliable)
        const jsonState = editor.getEditorState().toJSON()
        console.log('=== JSON STATE ===')
        console.log(JSON.stringify(jsonState, null, 2))

        // Method 3: Get plain text
        const plainText = editorElement?.textContent || ''
        console.log('=== PLAIN TEXT ===')
        console.log(plainText)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor])

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <button
          onClick={showHTML}
          className="rounded bg-blue-500 px-3 py-1 text-white"
        >
          📝 View HTML
        </button>
        <button
          onClick={showJSON}
          className="rounded bg-green-500 px-3 py-1 text-white"
        >
          📊 View JSON
        </button>
        <button
          onClick={showText}
          className="rounded bg-purple-500 px-3 py-1 text-white"
        >
          📄 View Text
        </button>
        <button
          onClick={showText}
          className="rounded bg-pink-500 px-3 py-1 text-white"
        >
          🧾 Ctrl+Shift+E Export
        </button>
      </div>

      {viewMode !== 'none' && (
        <div className="rounded bg-gray-100 p-4">
          <div className="mb-2 flex justify-between">
            <h3 className="font-semibold">
              {viewMode === 'html' && 'HTML Output'}
              {viewMode === 'json' && 'JSON State'}
              {viewMode === 'text' && 'Plain Text'}
            </h3>
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="rounded bg-gray-500 px-2 py-1 text-sm text-white"
            >
              📋 Copy
            </button>
          </div>
          <pre className="max-h-96 overflow-auto rounded bg-white p-3 text-xs select-text">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}

// Helper to format HTML for readability
function formatHTML(html: string): string {
  let indent = 0
  const tab = '  '

  return html
    .replace(/>\s*</g, '>\n<')
    .split('\n')
    .map(line => {
      line = line.trim()
      if (!line) return ''

      if (line.startsWith('</')) {
        indent = Math.max(0, indent - 1)
      }

      const indented = tab.repeat(indent) + line

      if (
        line.startsWith('<') &&
        !line.startsWith('</') &&
        !line.startsWith('<!') &&
        !line.endsWith('/>') &&
        !/^<(img|br|hr|input|meta|link|col)\b/i.test(line)
      ) {
        indent++
      }

      return indented
    })
    .filter(Boolean)
    .join('\n')
}
