'use client'

import { MetadataStoreProvider } from '@/views/media'

import { BrandSchema, type BrandFormT, type BrandSchemaT } from '../'

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
  BrandFormFields,
  type BrandFormFieldsPublicProps,
} from './BrandFormFields'

type BrandFormProps = {
  formId: string
  legend: string
  description: string
  defaultValues: BrandSchemaT
  onSubmit: (props: { value: BrandSchemaT; form: BrandFormT }) => Promise<void>
  fieldsProps: BrandFormFieldsPublicProps
  mediaKey: string
  mediaHref: string
  errorBanner?: React.ReactNode
}

export function BrandForm({
  formId,
  legend,
  description,
  defaultValues,
  onSubmit,
  fieldsProps,
  mediaKey,
  mediaHref,
  errorBanner,
}: BrandFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: BrandSchema },
    onSubmit: async props => {
      await onSubmit({
        value: props.value,
        form,
      })
    },
  })

  // Expose form to fields via render props
  const fieldsWithForm = { ...fieldsProps, form }

  return (
    <MetadataStoreProvider
      initialValues={{ mediaKey: 'editor-' + mediaKey, mediaPath: mediaHref }}
    >
      <FieldSet>
        <FieldLegend>{legend}</FieldLegend>

        {errorBanner && <FieldContent>{errorBanner}</FieldContent>}
        <FieldDescription>{description}</FieldDescription>

        <FieldGroup className="select-none">
          <form id={formId} onSubmit={e => e.preventDefault()}>
            <BrandFormFields {...fieldsWithForm} form={form} />
          </form>

          <FieldSeparator />

          <form.Subscribe selector={s => s.fieldMeta.slug?.isValidating}>
            {isValidating => (
              <Field orientation="responsive">
                <form.AppForm>
                  <form.SubscribeButton
                    form={formId}
                    label={fieldsProps.isCreate ? 'Add' : 'Update'}
                    disabled={isValidating}
                  />
                </form.AppForm>
              </Field>
            )}
          </form.Subscribe>
        </FieldGroup>
      </FieldSet>
    </MetadataStoreProvider>
  )
}
