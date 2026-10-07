import { resolveValue, safeId } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { Textarea } from '../ui/textarea'

type Props = {
  fieldClassName?: string
  label: string
  initialValue?: string
  placeholder?: string
  disabledLabel?: boolean
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement, Element>) => void
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  renderAfterInput?: React.ReactNode
} & Omit<
  React.ComponentProps<'textarea'>,
  'id' | 'value' | 'name' | 'type' | 'onChange' | 'onBlur'
>

export function TextareaField({
  fieldClassName,
  label,
  initialValue,
  placeholder,
  autoComplete = 'off',
  disabledLabel,
  onBlur,
  onChange,
  renderAfterInput,
  ...props
}: Props) {
  const field = useFieldContext<string>()
  const safeFieldId = safeId(field.name)

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const displayName = resolveValue(field.state.value, initialValue)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    field.handleChange(e.target.value)
    onChange?.(e)
  }

  function handleBlur(e: React.FocusEvent<HTMLTextAreaElement>) {
    field.handleBlur()
    onBlur?.(e)
  }

  return (
    <Field className={fieldClassName} data-invalid={isInvalid}>
      <FieldLabel
        className={disabledLabel ? 'text-muted' : undefined}
        htmlFor={safeFieldId}
      >
        {label}
      </FieldLabel>
      <Textarea
        {...props}
        id={safeFieldId}
        name={field.name}
        value={displayName}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {renderAfterInput}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
