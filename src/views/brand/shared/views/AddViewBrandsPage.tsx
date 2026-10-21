import React from 'react'

import { queryCategories } from '@/views/category'

import { brandErrors, queryBrands } from '../'

import { EmptyView } from '@/components/empty-view'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { AddBrand } from '../../features/AddBrand/AddBrand'
import { BrandsTable } from '../../features/ViewBrands/BrandsTable'

export function AddViewBrandsPage() {
  const brandsData = React.use(queryBrands())
  const categoriesData = React.use(
    queryCategories({ category_group: 'products' }),
  )

  const isBrandsData = brandsData.success

  return (
    <React.Suspense fallback={<Spinner />}>
      <AddBrand categoriesData={categoriesData} />
      <Separator className="my-5" />
      {isBrandsData ? (
        <div>
          <h1 className="mb-6 font-medium">Brands Table</h1>
          <BrandsTable brandsData={brandsData.brands} />
        </div>
      ) : (
        <EmptyView
          title={
            !isBrandsData && brandsData?.errors?.code
              ? brandErrors[brandsData.errors.code].client
              : ''
          }
          featureName="brand"
          formName="add new brand"
        />
      )}
    </React.Suspense>
  )
}
