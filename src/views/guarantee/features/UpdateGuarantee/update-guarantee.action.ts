'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { type TUpdateGuaranteeData } from '../../shared'

import { updateGuarantee } from './update-guarantee.db'

type UpdateGuaranteeActionProps = {
  formData: FormData
  currentSlug: string
}

export async function updateGuaranteeAction({
  formData,
  currentSlug,
}: UpdateGuaranteeActionProps) {
  const rawData: TUpdateGuaranteeData = {
    id: parseFormDataByKey(formData, 'id'),
    name: parseFormDataByKey(formData, 'name'),
    slug: parseFormDataByKey(formData, 'slug'),
    brand_id: parseFormDataByKey(formData, 'brand_id'),
    brand_name: parseFormDataByKey(formData, 'brand_name'),
    description: parseFormDataByKey(formData, 'description'),
    duration: parseFormDataByKey(formData, 'duration'),
    extra_price: parseFormDataByKey(formData, 'extra_price'),
    status: parseFormDataByKey(formData, 'status'),
    target_items: parseFormDataByKey(formData, 'target_items'),
    extra_duration: parseFormDataByKey(formData, 'extra_duration'),
  }

  const data: TUpdateGuaranteeData = Object.fromEntries(
    Object.entries(rawData).filter(([_, value]) => value !== null),
  ) as TUpdateGuaranteeData

  const result = await updateGuarantee(data)

  if (result.success) {
    if (currentSlug === result.guarantee.slug) {
      updateTag('guarantee-' + result.guarantee.id)
    } else {
      revalidatePath('/dashboard/products/guarantees/' + result.guarantee.slug)
    }

    updateTag('guarantees-props')
    updateTag('guarantees-list')

    for (let i = 0; i < result.productsId.length; i++) {
      const { id } = result.productsId[i]
      updateTag('product-' + id)
    }
  }

  return result
}

function parseFormDataByKey(fd: FormData, key: string) {
  const raw = fd.get(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw as string)
  } catch {
    return raw
  }
}
