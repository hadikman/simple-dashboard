'use server'

import { updateTag } from 'next/cache'

import { type TGuaranteeData, type TGuaranteeStatus } from '../../shared'

import { addGuarantee } from './add-guarantee.db'

export async function addGuaranteeAction(formData: FormData) {
  const rawData: TGuaranteeData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    brand_id: (formData.get('brand_id') as string) ?? null,
    brand_name: (formData.get('brand_name') as string) || '',
    description: (formData.get('description') as string) ?? '',
    duration: (formData.get('duration') as string) ?? '',
    extra_price: Number(formData.get('extra_price')) ?? 0,
    status: formData.get('status') as TGuaranteeStatus,
    target_items: JSON.parse((formData.get('target_items') as string) || '[]'),
    extra_duration: JSON.parse(
      (formData.get('extra_duration') as string) || '[]',
    ),
  }

  const result = await addGuarantee(rawData)

  if (result.success) {
    updateTag('guarantees-props')
    updateTag('guarantees-list')
  }

  return result
}
