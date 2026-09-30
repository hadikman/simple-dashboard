import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { IconArrowBack, IconArrowForward } from '@tabler/icons-react'
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  mergeRegister,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { useEffect, useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export function History() {
  const [editor] = useLexicalComposerContext()

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])

  return (
    <ToggleGroup variant="outline" type="multiple" size="sm">
      <ToggleGroupItem
        value="undo"
        disabled={!canUndo}
        title="Undo"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <IconArrowBack />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="redo"
        disabled={!canRedo}
        title="Redo"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <IconArrowForward />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
