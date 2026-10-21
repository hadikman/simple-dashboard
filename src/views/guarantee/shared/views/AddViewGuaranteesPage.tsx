import React from 'react'

import { queryCategories } from '@/views/category'

import { queryProducts } from '@/views/product'

import { queryBrands } from '@/views/brand'

import { getLockedPricesMap, guaranteeErrors, queryGuarantees } from '../'

import { EmptyView } from '@/components/empty-view'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { AddGuarantee } from '../../features/AddGuarantee/AddGuarantee'
import { GuaranteesTable } from '../../features/ViewGuarantees/GuaranteesTable'

export function AddViewGuaranteesPage() {
  const guaranteesData = React.use(queryGuarantees())
  const productsData = React.use(queryProducts({ type: 'published' }))
  const categoriesData = React.use(
    queryCategories({ category_group: 'products' }),
  )
  const brandsData = React.use(queryBrands())

  const isGuaranteesData = guaranteesData.success

  const guarantees = isGuaranteesData ? guaranteesData.guarantees : []
  const lockedPricesMap = getLockedPricesMap(guarantees)

  return (
    <React.Suspense fallback={<Spinner />}>
      <AddGuarantee
        categoriesData={categoriesData}
        productsData={productsData}
        brandsData={brandsData}
        lockedPricesMap={lockedPricesMap}
      />
      <Separator className="my-5" />
      {isGuaranteesData ? (
        <div>
          <h1 className="mb-6 font-medium">Guarantees Table</h1>
          <GuaranteesTable guaranteesData={guarantees} />
        </div>
      ) : (
        <EmptyView
          title={
            !isGuaranteesData && guaranteesData?.errors?.code
              ? guaranteeErrors[guaranteesData.errors.code].client
              : 'Empty Guarantees, Create A New Guarantee.'
          }
          featureName="guarantee"
          formName="add new guarantee"
        />
      )}
    </React.Suspense>
  )
}
