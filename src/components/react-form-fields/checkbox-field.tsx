import { resolveValue, safeId } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'
import { Checkbox } from '../ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '../ui/field'

type Props = {
  label: string
  initialValue?: boolean
  description?: string
  required?: boolean
  onBlur?: (e: React.FocusEvent<HTMLButtonElement, Element>) => void
  onChange?: (e: React.FormEvent<HTMLButtonElement>) => void
  renderAfterInput?: React.ReactNode
} & Omit<
  React.ComponentProps<typeof Checkbox>,
  'id' | 'checked' | 'onCheckedChange' | 'value' | 'onChange' | 'onBlur'
>

export function CheckboxField({
  label,
  initialValue,
  description,
  required,
  onBlur,
  onChange,
  renderAfterInput,
  ...props
}: Props) {
  const field = useFieldContext<boolean>()
  const safeFieldId = safeId(field.name)

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field orientation="horizontal" data-invalid={isInvalid}>
      <Checkbox
        {...props}
        id={safeFieldId}
        data-required={required}
        checked={resolveValue(field.state.value, initialValue) || false} // This false is a guard for when resolveValue returns ""
        onCheckedChange={checked => {
          field.handleChange(checked === true)
        }}
        onBlur={e => {
          field.handleBlur()
          if (onBlur) onBlur(e)
        }}
        onChange={e => {
          if (onChange) onChange(e)
        }}
      />
      {description ? (
        <FieldContent>
          <FieldLabel htmlFor={safeFieldId}>{label}</FieldLabel>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
        </FieldContent>
      ) : (
        <FieldLabel htmlFor={safeFieldId}>{label}</FieldLabel>
      )}
      {renderAfterInput}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
