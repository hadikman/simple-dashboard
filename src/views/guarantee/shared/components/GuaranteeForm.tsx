'use client'

import {
  type GuaranteeFormT,
  type GuaranteeSchemaT,
  GuaranteeSchema,
} from '../'

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
  type GuaranteeFormFieldsPublicProps,
  GuaranteeFormFields,
} from './GuaranteeFormFields'

type GuaranteeFormProps = {
  formId: string
  legend: string
  description: string
  defaultValues: GuaranteeSchemaT
  onSubmit: (props: {
    value: GuaranteeSchemaT
    form: GuaranteeFormT
  }) => Promise<void>
  fieldsProps: GuaranteeFormFieldsPublicProps
  errorBanner?: React.ReactNode
  submitLabel?: string
}

export function GuaranteeForm({
  formId,
  legend,
  description,
  defaultValues,
  onSubmit,
  fieldsProps,
  errorBanner,
  submitLabel,
}: GuaranteeFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: GuaranteeSchema },
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
          <GuaranteeFormFields {...fieldsWithForm} form={form} />
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
