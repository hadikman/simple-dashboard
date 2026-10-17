import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import { AutocompleteField } from '@/components/react-form-fields/autocomplete-field'
import { CheckboxField } from '@/components/react-form-fields/checkbox-field'
import { ComboboxField } from '@/components/react-form-fields/combobox-field'
import { DateTimeRangeField } from '@/components/react-form-fields/date-time-range-field'
import { EditorField } from '@/components/react-form-fields/editor-field'
import { GuaranteeTargetSelectorField } from '@/components/react-form-fields/guarantee-target-selector-field'
import { InventoryField } from '@/components/react-form-fields/inventory-field'
import { MediaField } from '@/components/react-form-fields/media-field'
import { NumberField } from '@/components/react-form-fields/number-field'
import { OfferTargetSelectorField } from '@/components/react-form-fields/offer-target-selector-field'
import { PricesField } from '@/components/react-form-fields/prices-field'
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
    AutocompleteField,
    NumberField,
    SelectField,
    CheckboxField,
    TextareaField,
    ComboboxField,
    MediaField,
    DateTimeRangeField,
    EditorField,
    InventoryField,
    PricesField,
    GuaranteeTargetSelectorField,
    OfferTargetSelectorField,
  },
  formComponents: {
    SubscribeButton,
  },
})
