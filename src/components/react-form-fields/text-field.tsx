import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { safeId, resolveValue } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'

type Props = {
  fieldClassName?: string
  label: string
  initialValue?: string
  disabledLabel?: boolean
  onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  renderAfterInput?: React.ReactNode
} & Omit<
  React.ComponentProps<'input'>,
  'id' | 'value' | 'name' | 'onChange' | 'onBlur'
>

export function TextField({
  fieldClassName,
  label,
  initialValue,
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    field.handleChange(e.target.value)
    onChange?.(e)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    field.handleBlur()
    onBlur?.(e)
  }

  return (
    <Field className={fieldClassName} data-invalid={isInvalid}>
      {label ? (
        <FieldLabel
          className={disabledLabel ? 'text-muted' : undefined}
          htmlFor={safeFieldId}
        >
          {label}
        </FieldLabel>
      ) : null}
      <Input
        {...props}
        id={safeFieldId}
        name={field.name}
        value={displayName}
        aria-invalid={isInvalid}
        autoComplete={autoComplete}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {renderAfterInput}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
