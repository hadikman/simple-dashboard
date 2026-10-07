import { resolveValue, safeId } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'
import { Editor } from '../editor'
import { EditorFieldValue } from '../editor/plugins/sync.plugin'
import { EditorExtensionProps } from '../editor/store/zustand/create-editor-store'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'

type Props = {
  label: string
  initialJsonValue?: Record<string, unknown>
  initialHtmlValue?: string
  initialTextValue?: string
  required?: boolean
  minimal?: boolean
  groupId?: string
  slug?: string
  status?: 'draft' | 'published'
} & EditorExtensionProps

export function EditorField({
  label,
  initialJsonValue,
  initialHtmlValue,
  initialTextValue,
  required = undefined,
  minimal = false,
  ...editorProps
}: Props) {
  const field = useFieldContext<EditorFieldValue>()
  const safeFieldId = safeId(field.name)

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const displayName: EditorFieldValue = {
    json:
      field.state.value.json ||
      (initialJsonValue !== undefined ? initialJsonValue : null),
    html: resolveValue(field.state.value.html, initialHtmlValue),
    text: resolveValue(field.state.value.text, initialTextValue),
  }

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={safeFieldId}>{label}</FieldLabel>
      <Input type="hidden" data-required={required} />
      <Editor
        minimal={minimal}
        value={displayName}
        onChange={value => {
          field.handleChange(value)
        }}
        onBlur={() => {
          field.handleBlur()
        }}
        {...editorProps}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
