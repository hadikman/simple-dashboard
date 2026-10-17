'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { type TUpdateBrandData } from '../../shared'

import { parseFormDataByKey, removeNullByRecursive } from '@/helpers/utils'
import { updateBrand } from './update-brand.db'

type UpdateBrandActionProps = {
  formData: FormData
  currentSlug: string
}

export async function updateBrandAction({
  formData,
  currentSlug,
}: UpdateBrandActionProps) {
  const rawData: TUpdateBrandData = {
    id: parseFormDataByKey(formData, 'id'),
    name: parseFormDataByKey(formData, 'name'),
    slug: parseFormDataByKey(formData, 'slug'),
    description: parseFormDataByKey(formData, 'description'),
    categories: parseFormDataByKey(formData, 'categories'),
    logo: {
      src: parseFormDataByKey(formData, 'src'),
      alt: parseFormDataByKey(formData, 'alt'),
    },
    website: parseFormDataByKey(formData, 'website'),
    email: parseFormDataByKey(formData, 'email'),
    phone: parseFormDataByKey(formData, 'phone'),
    stats: parseFormDataByKey(formData, 'stats'),
  }

  const data = removeNullByRecursive(rawData)

  const result = await updateBrand(data)

  if (result.success) {
    // If the slug is updated, don't need to update brand cache, it must shows stale data until fresh data be ready, otherwise the cache need to update to show fresh data immediately
    if (currentSlug === result.brand.slug) {
      updateTag('brand-' + result.brand.id)
    } else {
      revalidatePath('/dashboard/products/brands/' + result.brand.slug)
    }
    updateTag('brands-props')
    updateTag('brands-list')
  }

  return result
}
