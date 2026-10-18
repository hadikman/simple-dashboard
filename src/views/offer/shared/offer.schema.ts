'use client'

import { z } from 'zod'

import { useAppForm } from '@/hooks/create-react-form-hook'

export const OFFER_STATUS = [
  'draft',
  'scheduled',
  'active',
  'expired',
  'paused',
] as const
export const OFFER_DISABLED_STATUS = ['active', 'expired', 'paused']

const TargetItemSchema = z.object({
  product_group_id: z.string(),
  product_id: z.string(),
  category_id: z.string().nullable(),
  price_id: z.string(),
  original_price: z.number(),
  final_price: z.number(),
  // `offer_id` is only present during update (to clear detached targets).
  // Nullish keeps the add path valid.
  offer_id: z.string().nullish(),
})

// ─── Single schema for both Create and Update ────────────────
// Required fields always have values in both modes:
//   Create → user fills them in
//   Update → pre-populated from DB
// Optional fields use .nullish() to support three-state update:
//   value = update, null = clear, undefined = skip
export const OfferSchema = z
  .object({
    name: z.string().trim().min(1, 'The value is required.'),
    description: z.string().trim().nullish(),
    discount: z
      .number()
      .positive('The value is required.')
      .gt(0, 'Discount must be greater than 0%.')
      .lte(99.99, 'Discount cannot exceed 100%.'),
    offer_start: z.date('The value is required.'),
    offer_end: z.date('The value is required.'),
    status: z.enum(OFFER_STATUS),
    target_items: z
      .array(TargetItemSchema)
      .min(1, 'At least one price is required'),
  })
  .superRefine((data, ctx) => {
    const { offer_start, offer_end } = data

    if (offer_start && offer_end && offer_start > offer_end) {
      ctx.addIssue({
        path: ['offer_start'],
        message: 'The value must be lower than "Offer End".',
        code: 'custom',
      })
    }
  })

export type OfferSchemaT = z.input<typeof OfferSchema>
export type TargetItem = z.infer<typeof TargetItemSchema>

function _getOfferFormType() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAppForm({
    defaultValues: {} as OfferSchemaT,
    validators: { onSubmit: OfferSchema },
  })
}
export type OfferFormT = ReturnType<typeof _getOfferFormType>
