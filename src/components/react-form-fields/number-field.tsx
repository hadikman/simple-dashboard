import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { cn, resolveValue, safeId } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'

type Props = {
  fieldClassName?: string
  label: string
  initialValue?: number | undefined
  disabledLabel?: boolean
  onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  renderInputGroupAddon?: React.ReactNode
  renderAfterInput?: React.ReactNode
} & Omit<
  React.ComponentProps<'input'>,
  'id' | 'value' | 'name' | 'type' | 'onChange' | 'onBlur'
>

export function NumberField({
  fieldClassName,
  className,
  label,
  initialValue,
  min = 0,
  disabledLabel,
  required,
  onBlur,
  onChange,
  renderInputGroupAddon,
  renderAfterInput,
  ...props
}: Props) {
  const field = useFieldContext<number | undefined>()
  const safeFieldId = safeId(field.name)

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  function handleInputNumberOnFocus(e: React.FocusEvent<HTMLInputElement>) {
    // Prevent the input value change
    e.currentTarget.select()
  }

  // Prevent displaying initial value when the user clears the input
  const showInitialValue = field.state.meta.isPristine
  const displayValue = resolveValue(
    field.state.value,
    showInitialValue ? initialValue : '',
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    field.handleChange(value === '' ? undefined : e.target.valueAsNumber)

    onChange?.(e)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    field.handleBlur()

    const defaultValue = field.form.options.defaultValues?.[field.name]
    if (defaultValue === 0 && e.target.value === '') field.handleChange(0)

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
      <InputGroup data-required={required}>
        <InputGroupInput
          {...props}
          id={safeFieldId}
          className={cn(
            'focus:pointer-events-none focus:cursor-text',
            className,
          )}
          name={field.name}
          type="number"
          min={min}
          aria-invalid={isInvalid}
          value={displayValue}
          required={required}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleInputNumberOnFocus}
        />
        {renderInputGroupAddon}
      </InputGroup>
      {renderAfterInput}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
