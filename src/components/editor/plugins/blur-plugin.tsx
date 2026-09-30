import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { BLUR_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical'
import { useEffect } from 'react'

type BlurPluginProps = {
  onBlur: () => void
}

export function BlurPlugin({ onBlur }: BlurPluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      BLUR_COMMAND,
      () => {
        onBlur()
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, onBlur])

  return null
}
