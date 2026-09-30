import type { EditorThemeClasses } from 'lexical'

import './styles.css'

export const theme: EditorThemeClasses = {
  anchor: 'Editor__anchor',
  code: 'code-block',
  heading: {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
  },
  hr: 'Editor__hr',
  hrSelected: 'Editor__hrSelected',
  image: 'editor-image',
  layoutContainer: 'Editor__layoutContainer layout-container',
  layoutItem: 'Editor__layoutItem layout-item',
  link: 'Editor__link',
  list: {
    checklist: '',
    listitem: 'Editor__listItem',
    listitemChecked: 'Editor__listItemChecked list-item-checked',
    listitemUnchecked: 'Editor__listItemUnchecked',
    nested: {
      listitem: '',
    },
    ol: 'ol',
    olDepth: ['ol1', 'ol2', 'ol3', 'ol4', 'ol5'],
    ul: 'ul',
  },
  paragraph: 'Editor__paragraph',
  quote: 'Editor__quote',
  table: 'Editor__table',
  tableAddColumns: '',
  tableAddRows: '',
  tableAlignment: {
    center: '',
    right: '',
  },
  tableCell: 'Editor__tableCell',
  tableCellActionButton: '',
  tableCellActionButtonContainer: '',
  tableCellHeader: 'Editor__tableCellHeader',
  tableCellResizer: '',
  tableCellSelected: 'Editor__tableCellSelected',
  tableFrozenColumn: 'Editor__tableFrozenColumn',
  tableFrozenRow: 'Editor__tableFrozenRow',
  tableRowStriping: 'Editor__tableRowStriping table-row-striping',
  tableScrollableWrapper:
    'Editor__tableScrollableWrapper table-scrollable-wrapper',
  tableSelected: 'Editor__tableSelected',
  tableSelection: 'Editor__tableSelection',
  text: {
    bold: '',
    code: 'code-inline',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
  },
}
