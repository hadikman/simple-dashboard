'use client'

import { z } from 'zod'

import { useAppForm } from '@/hooks/create-react-form-hook'

export const GUARANTEE_STATUS = ['active', 'inactive'] as const

const TargetItemSchema = z.object({
  product_group_id: z.string(),
  product_id: z.string(),
  category_id: z.string().nullable(),
  price_id: z.string(),
  // `guarantee_id` is only present during update (to clear detached targets).
  // Nullish keeps the add path valid.
  guarantee_id: z.string().nullish(),
})

const ExtraDurationSchema = z.object({
  id: z.string(),
  duration: z.string().trim().min(1, 'Duration is required.'),
  price: z.number().nonnegative('The negative value not allowed.'),
})

// ─── Single schema for both Create and Update ────────────────
// Required fields always have values in both modes:
//   Create → user fills them in
//   Update → pre-populated from DB
// Optional fields use .nullish() to support three-state update:
//   value = update, null = clear, undefined = skip
export const GuaranteeSchema = z.object({
  name: z.string().trim().min(1, 'The value is required.'),
  brand_id: z.string().nullish(),
  duration: z.string().trim().min(1, 'The value is required.'),
  extra_price: z
    .number()
    .nonnegative('The negative value not allowed.')
    .nullish(),
  status: z.enum(GUARANTEE_STATUS),
  description: z.string().trim().nullish(),
  extra_duration: z.array(ExtraDurationSchema).nullish(),
  target_items: z
    .array(TargetItemSchema)
    .min(1, 'At least one price is required'),
})

export type GuaranteeSchemaT = z.input<typeof GuaranteeSchema>
export type TargetItem = z.infer<typeof TargetItemSchema>
export type ExtraDurationItem = z.infer<typeof ExtraDurationSchema>

function _getGuaranteeFormType() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAppForm({
    defaultValues: {} as GuaranteeSchemaT,
    validators: { onSubmit: GuaranteeSchema },
  })
}
export type GuaranteeFormT = ReturnType<typeof _getGuaranteeFormType>
