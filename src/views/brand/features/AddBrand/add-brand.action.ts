'use server'

import { updateTag } from 'next/cache'

import { type TBrandData } from '../../shared'

import { addBrand } from './add-brand.db'

export async function addBrandAction(formData: FormData) {
  const rawData: TBrandData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || '',
    categories: JSON.parse((formData.get('categories') as string) || '[]'),
    logo: {
      src: (formData.get('src') as string) || '',
      alt: (formData.get('alt') as string) || '',
    },
    website: ((formData.get('website') as string) || '').toLowerCase(),
    email: ((formData.get('email') as string) || '').toLowerCase(),
    phone: ((formData.get('phone') as string) || '').toLowerCase(),
    stats: { product_count: 0, total_sales: 0, average_rating: 0 },
  }

  const result = await addBrand(rawData)

  if (result.success) {
    updateTag('brands-list')
  }

  return result
}
