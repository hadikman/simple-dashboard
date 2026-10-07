'use client'

import React from 'react'

import { MetadataStoreProvider } from '@/views/media'

import {
  PostSchema,
  type PostFormT,
  type PostSchemaT,
  type TPostStatus,
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
  PostFormFields,
  type PostFormFieldsPublicProps,
} from './PostFormFields'

type PostFormProps = {
  formId: string
  legend: string
  description: string
  defaultValues: PostSchemaT
  onSubmit: (props: {
    value: PostSchemaT
    meta: TPostStatus
    form: PostFormT
  }) => Promise<void>
  fieldsProps: PostFormFieldsPublicProps
  mediaKey: string
  mediaHref: string
  badges?: React.ReactNode
  errorBanner?: React.ReactNode
}

export function PostForm({
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
}: PostFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: PostSchema },
    onSubmit: async props => {
      await onSubmit({
        value: props.value,
        meta: props.meta as TPostStatus,
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
            <PostFormFields {...fieldsWithForm} form={form} />
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
