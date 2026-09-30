import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/extension'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { IconPageBreak, IconSeparatorHorizontal } from '@tabler/icons-react'
import { INSERT_PAGE_BREAK } from '../../extensions/pages/page-break.extension'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { LexicalCommand } from 'lexical'

export function Divider() {
  const [editor] = useLexicalComposerContext()

  function handleClick(command: LexicalCommand<void>) {
    editor.update(() => editor.dispatchCommand(command, undefined))
  }

  return (
    <ButtonGroup>
      <Button
        variant="outline"
        size="icon"
        title="Insert Horizontal Line"
        onClick={() => handleClick(INSERT_HORIZONTAL_RULE_COMMAND)}
      >
        <IconSeparatorHorizontal />
      </Button>
      <Button
        variant="outline"
        size="icon"
        title="Insert Page Break"
        onClick={() => handleClick(INSERT_PAGE_BREAK)}
      >
        <IconPageBreak />
      </Button>
    </ButtonGroup>
  )
}
