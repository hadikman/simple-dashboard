'use client'

import React from 'react'

import { MetadataStoreProvider } from '@/views/media'

import {
  ProductSchema,
  type ProductFormT,
  type ProductSchemaT,
  type TProductStatus,
} from '../../shared'

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
  ProductFormFields,
  type ProductFormFieldsPublicProps,
} from './ProductFormFields'

type ProductFormProps = {
  formId: string
  legend: string
  description: string
  defaultValues: ProductSchemaT
  onSubmit: (props: {
    value: ProductSchemaT
    meta: TProductStatus
    form: ProductFormT
  }) => Promise<void>
  fieldsProps: ProductFormFieldsPublicProps
  mediaKey: string
  mediaHref: string
  badges?: React.ReactNode
  errorBanner?: React.ReactNode
}

export function ProductForm({
  formId,
  legend,
  description,
  defaultValues,
  onSubmit,
  fieldsProps,
  mediaKey,
  mediaHref,
  badges,
  errorBanner,
}: ProductFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: ProductSchema },
    onSubmit: async props => {
      await onSubmit({
        value: props.value,
        meta: props.meta as TProductStatus,
        form,
      })
    },
  })

  const fieldsWithForm = { ...fieldsProps, form }

  return (
    <MetadataStoreProvider
      initialValues={{ mediaKey: 'editor-' + mediaKey, mediaPath: mediaHref }}
    >
      <FieldSet>
        <FieldLegend
          data-has-badge={!!badges}
          className="data-[has-badge=true]:flex data-[has-badge=true]:w-full data-[has-badge=true]:flex-wrap data-[has-badge=true]:justify-between"
        >
          {legend}
          {badges}
        </FieldLegend>

        {errorBanner && <FieldContent>{errorBanner}</FieldContent>}
        <FieldDescription>{description}</FieldDescription>

        <FieldGroup className="select-none">
          <form id={formId} onSubmit={e => e.preventDefault()}>
            <ProductFormFields {...fieldsWithForm} form={form} />
          </form>

          <FieldSeparator />

          <form.Subscribe selector={s => s.fieldMeta.slug?.isValidating}>
            {isValidating => (
              <Field orientation="responsive">
                <form.AppForm>
                  <form.SubscribeButton
                    form={formId}
                    label="Save as draft"
                    variant="secondary"
                    formSubmitMeta="draft"
                    disabled={isValidating}
                  />
                  <form.SubscribeButton
                    form={formId}
                    label="Publish"
                    formSubmitMeta="published"
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
