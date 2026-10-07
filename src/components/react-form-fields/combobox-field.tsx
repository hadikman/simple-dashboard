import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '@/components/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { resolveValue, safeId } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'

// If changed it should be reflected into post.schema.ts (CategoryItemSchema)
type ComboboxItemType = {
  id: string
  title: string
}

type Props = {
  fieldClassName?: string
  label?: string
  initialValue?: ComboboxItemType[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  items: ComboboxItemType[]
  onBlur?: () => void
  onChange?: (value: ComboboxItemType[]) => void
  renderItems?: (item: ComboboxItemType) => React.ReactNode
} & Omit<
  React.ComponentProps<typeof Combobox>,
  | 'value'
  | 'name'
  | 'onValueChange'
  | 'items'
  | 'multiple'
  | 'children'
  | 'defaultValue'
>

export function ComboboxField({
  fieldClassName,
  label,
  initialValue,
  placeholder,
  required,
  disabled,
  items,
  onBlur,
  onChange,
  renderItems,
  ...props
}: Props) {
  // TanStack Form field manages the list of `{ id, title }` objects
  const field = useFieldContext<ComboboxItemType[]>()
  const safeFieldId = safeId(field.name)

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  // Retrieve current form value state or initial values
  const effectiveValues = resolveValue(field.state.value, initialValue) || []

  // Extract selected IDs to pass into the base Combobox component
  const displayValues = effectiveValues.map(item => item.id)

  function handleValueChange(selectedIds: string[]) {
    // Map string IDs back to their corresponding `{ id, title }` objects from original items
    const updatedObjects = items.filter(item => selectedIds.includes(item.id))
    field.handleChange(updatedObjects)
    onChange?.(updatedObjects)
  }

  function handleBlur() {
    field.handleBlur()
    onBlur?.()
  }

  // Fallback default renderer if renderItems is not passed
  const defaultRenderItem = (item: ComboboxItemType) => (
    <ComboboxItem key={item.id} value={item.id}>
      {item.title}
    </ComboboxItem>
  )

  return (
    <Field className={fieldClassName} data-invalid={isInvalid}>
      {label ? <FieldLabel htmlFor={safeFieldId}>{label}</FieldLabel> : null}
      <Combobox
        {...props}
        items={items}
        multiple
        value={displayValues}
        onValueChange={handleValueChange}
        disabled={disabled}
        aria-invalid={isInvalid}
      >
        <ComboboxChips data-required={required}>
          <ComboboxValue>
            {effectiveValues.map(item => (
              <ComboboxChip key={item.id}>{item.title}</ComboboxChip>
            ))}
          </ComboboxValue>
          <ComboboxChipsInput
            id={safeFieldId}
            placeholder={placeholder}
            onBlur={handleBlur}
          />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {item =>
              (renderItems || defaultRenderItem)(item as ComboboxItemType)
            }
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
