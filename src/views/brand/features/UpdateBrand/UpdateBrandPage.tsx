import React from 'react'

import { queryCategories } from '@/views/category'

import { Spinner } from '@/components/ui/spinner'
import { UpdateBrand } from './UpdateBrand'
import { queryBrand } from './query-brand'

type UpdateBrandPageProps = {
  slug: string
}

export function UpdateBrandPage({ slug }: UpdateBrandPageProps) {
  const brandData = React.use(queryBrand({ slug }))
  const categoriesData = React.use(
    queryCategories({ category_group: 'products' }),
  )

  const brandKey = brandData.success
    ? `brand-${brandData.brand.id}-${brandData.brand.updated_at}`
    : `brand-${slug}`

  return (
    <React.Suspense fallback={<Spinner />}>
      <UpdateBrand
        brandKey={brandKey}
        brandData={brandData}
        categoriesData={categoriesData}
      />
    </React.Suspense>
  )
}
