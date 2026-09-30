import type { JSX } from 'react'
import type { Option, Options, PollNode } from '../nodes/poll/poll.node'

import '../nodes/poll/poll-node.css'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  NodeKey,
} from 'lexical'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { $isPollNode, createPollOption } from '../nodes/poll/poll.node'

function PollOptionComponent({
  option,
  index,
  options,
  totalVotes,
  withPollNode,
}: {
  index: number
  option: Option
  options: Options
  totalVotes: number
  withPollNode: (
    cb: (pollNode: PollNode) => void,
    onSelect?: () => void,
  ) => void
}): JSX.Element {
  // STANDBY useCollaborationContext() to works, it requires CollaborationPlugin (Yjs collaboration)
  // const { name: username } = useCollaborationContext()
  const username = 'Guest'
  const checkboxRef = useRef(null)
  const votesArray = option.votes
  const checkedIndex = votesArray.indexOf(username)
  const checked = checkedIndex !== -1
  const votes = votesArray.length
  const text = option.text

  return (
    <div className="Poll__optionContainer">
      <div
        className={joinClasses(
          'Poll__optionCheckboxWrapper',
          checked && 'Poll__optionCheckboxChecked',
        )}
      >
        <input
          ref={checkboxRef}
          className="Poll__optionCheckbox"
          type="checkbox"
          onChange={e => {
            withPollNode(node => {
              node.toggleVote(option, username)
            })
          }}
          checked={checked}
        />
      </div>
      <div className="Poll__optionInputWrapper">
        <div
          className="Poll__optionInputVotes"
          style={{ width: `${votes === 0 ? 0 : (votes / totalVotes) * 100}%` }}
        />
        <span className="Poll__optionInputVotesCount">
          {votes > 0 && (votes === 1 ? '1 vote' : `${votes} votes`)}
        </span>
        <input
          className="Poll__optionInput"
          type="text"
          value={text}
          onChange={e => {
            const target = e.target
            const value = target.value
            const selectionStart = target.selectionStart
            const selectionEnd = target.selectionEnd
            withPollNode(
              node => {
                node.setOptionText(option, value)
              },
              () => {
                target.selectionStart = selectionStart
                target.selectionEnd = selectionEnd
              },
            )
          }}
          placeholder={`Option ${index + 1}`}
        />
      </div>
      <button
        disabled={options.length < 3}
        className={joinClasses(
          'Poll__optionDelete',
          options.length < 3 && 'Poll__optionDeleteDisabled',
        )}
        aria-label="Remove"
        onClick={() => {
          withPollNode(node => {
            node.deleteOption(option)
          })
        }}
      />
    </div>
  )
}

export default function PollComponent({
  question,
  options,
  nodeKey,
}: {
  nodeKey: NodeKey
  options: Options
  question: string
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const totalVotes = useMemo(() => getTotalVotes(options), [options])
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey)
  const [selection, setSelection] = useState<BaseSelection | null>(null)
  const ref = useRef(null)

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        setSelection(editorState.read(() => $getSelection()))
      }),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        payload => {
          const event = payload

          if (event.target === ref.current) {
            if (!event.shiftKey) {
              clearSelection()
            }
            setSelected(!isSelected)
            return true
          }

          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [clearSelection, editor, isSelected, nodeKey, setSelected])

  const withPollNode = (
    cb: (node: PollNode) => void,
    onUpdate?: () => void,
  ): void => {
    editor.update(
      () => {
        const node = $getNodeByKey(nodeKey)
        if ($isPollNode(node)) {
          cb(node)
        }
      },
      { onUpdate },
    )
  }

  const addOption = () => {
    withPollNode(node => {
      node.addOption(createPollOption())
    })
  }

  const isFocused = $isNodeSelection(selection) && isSelected

  return (
    <div className={`Poll__container ${isFocused ? 'focused' : ''}`} ref={ref}>
      <div className="Poll__inner">
        <h2 className="Poll__heading">{question}</h2>
        {options.map((option, index) => {
          const key = option.uid
          return (
            <PollOptionComponent
              key={key}
              withPollNode={withPollNode}
              option={option}
              index={index}
              options={options}
              totalVotes={totalVotes}
            />
          )
        })}
        <div className="Poll__footer">
          <Button onClick={addOption} size="sm">
            Add Option
          </Button>
        </div>
      </div>
    </div>
  )
}

function getTotalVotes(options: Options): number {
  return options.reduce((totalVotes, next) => {
    return totalVotes + next.votes.length
  }, 0)
}

function joinClasses(...args: Array<string | boolean | null | undefined>) {
  return args.filter(Boolean).join(' ')
}
