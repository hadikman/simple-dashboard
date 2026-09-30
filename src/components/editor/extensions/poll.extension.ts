import { defineImportRule, DOMImportExtension, sel } from '@lexical/html'
import { $wrapNodeInElement } from '@lexical/utils'
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  configExtension,
  createCommand,
  defineExtension,
  LexicalCommand,
} from 'lexical'

import {
  $createPollNode,
  createPollOption,
  PollNode,
} from '../nodes/poll/poll.node'

export const INSERT_POLL_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_POLL_COMMAND',
)

function $convertPollElement(el: HTMLElement) {
  const question = el.getAttribute('data-lexical-poll-question')
  const options = el.getAttribute('data-lexical-poll-options')
  if (question === null || options === null) {
    return null
  }
  return $createPollNode(question, JSON.parse(options))
}

const PollImportRule = defineImportRule({
  $import: (_ctx, el, $next) => {
    const node = $convertPollElement(el)
    return node ? [node] : $next()
  },
  match: sel.tag('span').attr('data-lexical-poll-question', true),
  name: '@lexical/poll',
})

export const PollExtension = defineExtension({
  dependencies: [
    configExtension(DOMImportExtension, { rules: [PollImportRule] }),
  ],
  name: '@lexical/Poll',
  nodes: [PollNode],
  register: editor =>
    editor.registerCommand<string>(
      INSERT_POLL_COMMAND,
      payload => {
        const pollNode = $createPollNode(payload, [
          createPollOption(),
          createPollOption(),
        ])
        $insertNodes([pollNode])
        if ($isRootOrShadowRoot(pollNode.getParentOrThrow())) {
          $wrapNodeInElement(pollNode, $createParagraphNode).selectEnd()
        }
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
})
