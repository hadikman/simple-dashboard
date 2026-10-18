import React from 'react'

import { queryProducts } from '@/views/product'

import { queryCategories } from '@/views/category'

import { queryBrands } from '@/views/brand'

import { getLockedPricesMap, queryGuarantees } from '../../shared'

import { Spinner } from '@/components/ui/spinner'
import { UpdateGuarantee } from './UpdateGuarantee'
import { queryGuarantee } from './query-guarantee'

type UpdateGuaranteePageProps = {
  slug: string
}

export function UpdateGuaranteePage({ slug }: UpdateGuaranteePageProps) {
  const guaranteesData = React.use(queryGuarantees())
  const guaranteeData = React.use(queryGuarantee({ slug }))
  const categoriesData = React.use(
    queryCategories({ category_group: 'products' }),
  )
  const productsData = React.use(queryProducts({ type: 'published' }))
  const brandsData = React.use(queryBrands())

  const isGuaranteesData = guaranteesData.success

  const guarantees = isGuaranteesData ? guaranteesData.guarantees : []
  const lockedPricesMap = getLockedPricesMap(guarantees, slug)

  const guaranteeKey = guaranteeData.success
    ? `guarantee-${guaranteeData.guarantee.id}-${guaranteeData.guarantee.updated_at}`
    : `guarantee-${slug}`

  return (
    <React.Suspense fallback={<Spinner />}>
      <UpdateGuarantee
        guaranteeKey={guaranteeKey}
        guaranteeData={guaranteeData}
        categoriesData={categoriesData}
        productsData={productsData}
        brandsData={brandsData}
        lockedPricesMap={lockedPricesMap}
      />
    </React.Suspense>
  )
}
