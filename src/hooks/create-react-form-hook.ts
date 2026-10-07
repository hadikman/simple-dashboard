import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import { CheckboxField } from '@/components/react-form-fields/checkbox-field'
import { ComboboxField } from '@/components/react-form-fields/combobox-field'
import { DateTimeRangeField } from '@/components/react-form-fields/date-time-range-field'
import { EditorField } from '@/components/react-form-fields/editor-field'
import { MediaField } from '@/components/react-form-fields/media-field'
import { SelectField } from '@/components/react-form-fields/select-field'
import { SubscribeButton } from '@/components/react-form-fields/subscribe-button'
import { TextField } from '@/components/react-form-fields/text-field'
import { TextareaField } from '@/components/react-form-fields/textarea-field'

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SelectField,
    CheckboxField,
    TextareaField,
    ComboboxField,
    MediaField,
    DateTimeRangeField,
    EditorField,
  },
  formComponents: {
    SubscribeButton,
  },
})
