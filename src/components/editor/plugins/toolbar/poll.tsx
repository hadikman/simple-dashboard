import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { IconHttpOptions } from '@tabler/icons-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useModalStore } from '@/store/zustand/modal/modal-stores-provider'
import { DialogComponent } from '../../components/dialog.component'
import { INSERT_POLL_COMMAND } from '../../extensions/poll.extension'
import { MODAL_STORE_KEY } from '../draggable-block/draggable-block.plugin'

export function Poll() {
  const [editor] = useLexicalComposerContext()
  const [question, setQuestion] = useState('')
  const [show, setShow] = useState(false)

  const key = MODAL_STORE_KEY
  const component = useModalStore(key!, state => state.component)
  const setComponent = useModalStore(key!, state => state.setComponent)

  const open = show || component === 'poll'
  const isDisabled = question.trim() === ''

  function handleClick() {
    editor.dispatchCommand(INSERT_POLL_COMMAND, question)
    setShow(false)
    setComponent(null)
  }

  return (
    <DialogComponent
      open={open}
      onOpenChange={open => {
        setShow(open)

        if (!open) {
          setComponent(null)
        }
      }}
      renderTrigger={
        <Button
          size="icon"
          variant="outline"
          title="Insert Poll"
          onClick={() => setShow(true)}
        >
          <IconHttpOptions />
        </Button>
      }
      renderContent={
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="poll">Insert Poll</FieldLabel>
            <Input
              name="poll"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
          </Field>

          <Field orientation="horizontal">
            <Button size="sm" disabled={isDisabled} onClick={handleClick}>
              Confirm
            </Button>
          </Field>
        </FieldGroup>
      }
    />
  )
}
