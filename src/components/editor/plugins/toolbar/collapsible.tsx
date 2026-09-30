import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { IconLayoutBottombarCollapse } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

import { INSERT_COLLAPSIBLE_COMMAND } from '../../extensions/collapsible/collapsible.extension'

export function Collapsible() {
  const [editor] = useLexicalComposerContext()

  function handleClick() {
    editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined)
  }

  return (
    <Button
      size="icon"
      variant="outline"
      title="Insert Collapsible Container"
      onClick={handleClick}
    >
      <IconLayoutBottombarCollapse />
    </Button>
  )
}
