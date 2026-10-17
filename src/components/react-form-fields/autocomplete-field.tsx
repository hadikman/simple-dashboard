'use client'

import React from 'react'

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteList,
} from '@/components/ui/autocomplete'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { resolveValue, safeId } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'

type Props = {
  autoHighlight?: boolean
  fieldClassName?: string
  initialValue?: string
  items: { id: string; value: string }[]
  label?: string
  disabledLabel?: boolean
  renderAutocompleteInputAddon?: React.ReactNode
} & Omit<
  React.ComponentProps<typeof AutocompleteInput>,
  'id' | 'name' | 'onBlur'
>

export function AutocompleteField({
  autoHighlight,
  fieldClassName,
  initialValue,
  items,
  label,
  disabledLabel,
  required,
  renderAutocompleteInputAddon,
  ...props
}: Props) {
  const field = useFieldContext<string>()

  const safeFieldId = safeId(field.name)

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const displayName = resolveValue(field.state.value, initialValue)

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
      <Autocomplete
        autoHighlight={autoHighlight}
        items={items}
        value={displayName}
        onValueChange={field.handleChange}
      >
        <AutocompleteInputGroup data-required={required}>
          <AutocompleteInput
            id={safeFieldId}
            name={field.name}
            aria-invalid={isInvalid}
            required={required}
            grouped
            onBlur={field.handleBlur}
            {...props}
          />
          {renderAutocompleteInputAddon}
        </AutocompleteInputGroup>
        <AutocompleteContent>
          <AutocompleteEmpty>No items found.</AutocompleteEmpty>
          <AutocompleteList>
            {item => (
              <AutocompleteItem key={item.id} value={item.value}>
                {item.value}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
