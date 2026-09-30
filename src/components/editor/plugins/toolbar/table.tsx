import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import { IconColumns, IconTable } from '@tabler/icons-react'
import { $findMatchingParent, $getSelection, $isRangeSelection } from 'lexical'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useModalStore } from '@/store/zustand/modal/modal-stores-provider'
import { DialogComponent } from '../../components/dialog.component'
import { INSERT_LAYOUT_COMMAND } from '../../extensions/layout.extension'
import { $isLayoutContainerNode } from '../../nodes/layout/layout-container.node'
import { $isCustomTableNode } from '../../nodes/table.node'
import { MODAL_STORE_KEY } from '../draggable-block/draggable-block.plugin'

export function Table() {
  return (
    <ButtonGroup>
      <InsertTable />
      <InsertColumns />
    </ButtonGroup>
  )
}

export function InsertTable() {
  const [editor] = useLexicalComposerContext()
  const [show, setShow] = useState(false)
  const [rows, setRows] = useState('5')
  const [columns, setColumns] = useState('3')
  const [headerRow, setHeaderRow] = useState(true)
  const [headerColumn, setHeaderColumn] = useState(false)
  const [fullWidth, setFullWidth] = useState(false)

  const key = MODAL_STORE_KEY
  const component = useModalStore(key!, state => state.component)
  const setComponent = useModalStore(key!, state => state.setComponent)

  const open = show || component === 'table'
  const [isInsideTable, setIsInsideTable] = useState(false)

  const row = Number(rows)
  const column = Number(columns)
  const isDisabled =
    !row || row < 1 || row > 500 || !column || column < 1 || column > 50

  useEffect(() => {
    if (!show) return

    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        setIsInsideTable(false)
        return
      }

      const anchorNode = selection.anchor.getNode()
      const tableParent = $findMatchingParent(anchorNode, $isCustomTableNode)
      setIsInsideTable(tableParent !== null)
    })
  }, [editor, show])

  function onInsertTable() {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows,
      includeHeaders: { rows: headerRow, columns: headerColumn },
    })

    if (fullWidth) {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const anchorNode = selection.anchor.getNode()
        const tableNode = $findMatchingParent(anchorNode, $isCustomTableNode)

        if (tableNode) {
          tableNode.setFullWidth(true)
        }
      })
    }

    setShow(false)
    setRows('5')
    setColumns('3')
    setHeaderRow(true)
    setHeaderColumn(false)
    setFullWidth(false)
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
          title="Insert Table"
          onClick={() => setShow(true)}
        >
          <IconTable />
        </Button>
      }
      renderContent={
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="rows">Rows</FieldLabel>
              <Input
                type="number"
                name="input-rows"
                placeholder={'# of rows (1-500)'}
                value={rows}
                onChange={e => setRows(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="columns">Columns</FieldLabel>
              <Input
                type="number"
                name="input-columns"
                placeholder={'# of columns (1-50)'}
                value={columns}
                onChange={e => setColumns(e.target.value)}
              />
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="header-row"
                name="header-row"
                defaultChecked
                onCheckedChange={e => setHeaderRow(e as boolean)}
              />
              <Label htmlFor="header-row">Include Header Row</Label>
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="header-column"
                name="header-column"
                onCheckedChange={e => setHeaderColumn(e as boolean)}
              />
              <Label htmlFor="header-column">Include Header Column</Label>
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="full-width"
                name="full-width"
                checked={fullWidth}
                onCheckedChange={e => setFullWidth(e as boolean)}
              />
              <Label htmlFor="full-width">Full Width</Label>
            </Field>

            {isInsideTable && (
              <Field>
                <FieldContent>
                  <FieldTitle>Table Nesting</FieldTitle>
                  <FieldDescription>
                    Cannot insert a table inside another table.
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}

            <Field orientation="horizontal">
              <Button
                size="sm"
                disabled={isDisabled || isInsideTable}
                onClick={onInsertTable}
              >
                Insert
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      }
    />
  )
}

const LAYOUTS = [
  { label: '2 Columns (equal width)', value: '1fr 1fr' },
  { label: '2 Columns (25% - 75%)', value: '1fr 3fr' },
  { label: '3 Columns (equal width)', value: '1fr 1fr 1fr' },
  { label: '3 Columns (25% - 50% - 25%)', value: '1fr 2fr 1fr' },
  { label: '4 Columns (equal width)', value: '1fr 1fr 1fr 1fr' },
]

export function InsertColumns() {
  const [editor] = useLexicalComposerContext()
  const [show, setShow] = useState(false)
  const [layout, setLayout] = useState(LAYOUTS[0].value)

  const key = MODAL_STORE_KEY
  const component = useModalStore(key!, state => state.component)
  const setComponent = useModalStore(key!, state => state.setComponent)

  const open = show || component === 'layout'
  const [isInsideLayout, setIsInsideLayout] = useState(false)

  function handleClick() {
    editor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout)

    setShow(false)
    setLayout(LAYOUTS[0].value)
    setComponent(null)
  }
  // TODO Insert handler between cols to adjuest cols size, and a tooltip in top of each col to show the size, and update the cols size manually
  // Sync state to check if we are allowed to insert
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode()
          setIsInsideLayout(!!$findMatchingParent(node, $isLayoutContainerNode))
        }
      })
    })
  }, [editor])

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
          title="Insert Columns"
          disabled={isInsideLayout}
          onClick={() => setShow(true)}
        >
          <IconColumns />
        </Button>
      }
      renderContent={
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="layout">Select Columns Layout</FieldLabel>
            <Select name="layout" value={layout} onValueChange={setLayout}>
              <SelectTrigger id="layout">
                <SelectValue defaultValue={layout} />
              </SelectTrigger>
              <SelectContent>
                {LAYOUTS.map(({ label, value }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field orientation="horizontal">
            <Button size="sm" onClick={handleClick}>
              Insert
            </Button>
          </Field>
        </FieldGroup>
      }
    />
  )
}
