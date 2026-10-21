'use client'

import z from 'zod'

import { useAppForm } from '@/hooks/create-react-form-hook'

export const FeatureValueSchema = z.object({
  value: z.string().trim().min(1, 'The value is required.'),
})
export type FeatureValueSchemaT = z.input<typeof FeatureValueSchema>

function _getFeatureValueFormType() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAppForm({
    defaultValues: {} as FeatureValueSchemaT,
    validators: { onSubmit: FeatureValueSchema },
  })
}
export type FeatureValueFormT = ReturnType<typeof _getFeatureValueFormType>
