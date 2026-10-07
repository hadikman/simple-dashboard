import * as SelectPrimitive from '@radix-ui/react-select'

import { resolveValue, safeId } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'
import { Field, FieldError, FieldLabel } from '../ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

type Props = {
  fieldClassName?: string
  label?: string
  initialValue?: string
  defaultValue?: string
  placeholder?: string
  selectTriggerSize?: React.ComponentProps<typeof SelectTrigger>['size']
  required?: boolean
  onBlur?: (e: React.FocusEvent<HTMLButtonElement, Element>) => void
  onChange?: (e: React.ChangeEvent<HTMLButtonElement>) => void
  renderItems: React.ReactNode
  renderAfterInput?: React.ReactNode
} & Omit<
  React.ComponentProps<typeof SelectPrimitive.Root>,
  'value' | 'name' | 'onValueChange'
>

export function SelectField({
  fieldClassName,
  label,
  initialValue,
  defaultValue,
  placeholder,
  selectTriggerSize,
  required,
  onBlur,
  onChange,
  renderItems,
  renderAfterInput,
  ...props
}: Props) {
  const field = useFieldContext<string>()
  const safeFieldId = safeId(field.name)

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const displayValue = resolveValue(
    field.state.value,
    initialValue || defaultValue || initialValue,
  )

  function handleValueChange(value: string) {
    field.handleChange(value === '__none' ? '' : value)
  }

  function handleChange(e: React.ChangeEvent<HTMLButtonElement>) {
    onChange?.(e)
  }

  function handleBlur(e: React.FocusEvent<HTMLButtonElement>) {
    field.handleBlur()
    onBlur?.(e)
  }

  return (
    <Field className={fieldClassName} data-invalid={isInvalid}>
      {label ? <FieldLabel htmlFor={safeFieldId}>{label}</FieldLabel> : null}
      <Select
        {...props}
        name={safeFieldId}
        value={displayValue}
        onValueChange={handleValueChange}
        aria-invalid={isInvalid}
      >
        <SelectTrigger
          id={field.name}
          data-required={required}
          size={selectTriggerSize}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <SelectValue
            placeholder={placeholder}
            defaultValue={defaultValue ?? undefined}
          />
        </SelectTrigger>
        <SelectContent>
          {!defaultValue ? (
            <SelectGroup>
              <SelectItem value="__none">Choose later</SelectItem>
            </SelectGroup>
          ) : null}
          {renderItems}
        </SelectContent>
      </Select>
      {renderAfterInput}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
