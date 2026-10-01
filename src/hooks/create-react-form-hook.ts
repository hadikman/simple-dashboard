import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import { SelectField } from '@/components/react-form-fields/select-field'
import { SubscribeButton } from '@/components/react-form-fields/subscribe-button'
import { TextField } from '@/components/react-form-fields/text-field'

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SelectField,
  },
  formComponents: {
    SubscribeButton,
  },
})
