import { defineImportRule, DOMImportExtension, sel } from '@lexical/html'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  configExtension,
  createCommand,
  defineExtension,
  LexicalCommand,
} from 'lexical'

import {
  $createPageBreakNode,
  PageBreakNode,
} from '../../nodes/page-break/page-break.node'

export const INSERT_PAGE_BREAK: LexicalCommand<undefined> =
  /* @__PURE__ */ createCommand()

const PageBreakImportRule = /* @__PURE__ */ defineImportRule({
  $import: () => [$createPageBreakNode()],
  match: sel.tag('hr').attr('data-lexical-page-break', 'true'),
  name: '@lexical/page-break',
})

// Backward compatibility: older playground exports rendered the page break
// as `<figure type="page-break">`. Match that form too so older documents
// still round-trip into a PageBreakNode instead of being silently dropped
// by the generic `<figure>` rule from ImagesExtension.
const PageBreakLegacyImportRule = /* @__PURE__ */ defineImportRule({
  $import: () => [$createPageBreakNode()],
  match: sel.tag('figure').attr('type', 'page-break'),
  name: '@lexical/page-break-legacy',
})

export const PageBreakExtension = /* @__PURE__ */ defineExtension({
  dependencies: [
    /* @__PURE__ */ configExtension(DOMImportExtension, {
      rules: [PageBreakImportRule, PageBreakLegacyImportRule],
    }),
  ],
  name: '@lexical/PageBreak',
  nodes: [PageBreakNode],
  register: editor =>
    editor.registerCommand(
      INSERT_PAGE_BREAK,
      () => {
        const selection = $getSelection()

        if (!$isRangeSelection(selection)) {
          return false
        }

        const focusNode = selection.focus.getNode()
        if (focusNode !== null) {
          const pgBreak = $createPageBreakNode()
          $insertNodeToNearestRoot(pgBreak)
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
})
