'use client'

import { type OfferFormT, type OfferSchemaT, OfferSchema } from '../'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { useAppForm } from '@/hooks/create-react-form-hook'
import {
  type OfferFormFieldsPublicProps,
  OfferFormFields,
} from './OfferFormFields'

type OfferFormProps = {
  formId: string
  legend: string
  description: string
  defaultValues: OfferSchemaT
  onSubmit: (props: { value: OfferSchemaT; form: OfferFormT }) => Promise<void>
  fieldsProps: OfferFormFieldsPublicProps
  errorBanner?: React.ReactNode
  submitLabel?: string
}

export function OfferForm({
  formId,
  legend,
  description,
  defaultValues,
  onSubmit,
  fieldsProps,
  errorBanner,
  submitLabel,
}: OfferFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: OfferSchema },
    onSubmit: async props => {
      await onSubmit({ value: props.value, form })
    },
  })

  const fieldsWithForm = { ...fieldsProps, form }

  return (
    <FieldSet>
      <FieldLegend>{legend}</FieldLegend>
      {errorBanner && <FieldContent>{errorBanner}</FieldContent>}
      <FieldDescription>{description}</FieldDescription>

      <FieldGroup className="select-none">
        <form id={formId} onSubmit={e => e.preventDefault()}>
          <OfferFormFields {...fieldsWithForm} form={form} />
        </form>

        <FieldSeparator />

        <form.Subscribe selector={s => s.fieldMeta.name?.isValidating}>
          {isValidating => (
            <Field orientation="responsive">
              <form.AppForm>
                <form.SubscribeButton
                  form={formId}
                  label={
                    submitLabel ?? (fieldsProps.isCreate ? 'Add' : 'Update')
                  }
                  disabled={isValidating}
                />
              </form.AppForm>
            </Field>
          )}
        </form.Subscribe>
      </FieldGroup>
    </FieldSet>
  )
}
