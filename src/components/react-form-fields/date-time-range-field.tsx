import { resolveValue, safeId } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { DateTimeRangePicker } from '../date-time-range-picker'

type Props = {
  label: string
  initialValue?: Date
  title: string
  description?: string
  required?: boolean
  onBlur?: (e: React.FocusEvent<HTMLButtonElement, Element>) => void
  onChange?: (e: React.ChangeEvent<HTMLButtonElement>) => void
  renderAfterInput?: React.ReactNode
}

export function DateTimeRangeField({
  label,
  initialValue,
  title = 'Date Picker',
  description,
  required,
  onBlur,
  onChange,
  renderAfterInput,
}: Props) {
  const field = useFieldContext<Date | string>()
  const safeFieldId = safeId(field.name)

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  // Prevent displaying initial value when the user clears the input
  const showInitialValue = field.state.meta.isPristine
  const displayValue = resolveValue(
    field.state.value,
    showInitialValue ? initialValue : null,
  )

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={safeFieldId}>{label}</FieldLabel>
      <DateTimeRangePicker
        id={safeFieldId}
        title={title}
        description={description}
        required={required}
        value={displayValue}
        onSelectedDate={field.handleChange}
        onBlur={onBlur}
        onChange={onChange}
      />
      {renderAfterInput}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
