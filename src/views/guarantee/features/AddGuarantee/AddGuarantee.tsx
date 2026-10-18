'use client'

import { type TGetCategoriesResponse } from '@/views/category'

import { type TGetProductsResponse } from '@/views/product'

import { type TGetBrandsResponse } from '@/views/brand'

import {
  type GuaranteeSchemaT,
  type TLockedPricesMap,
  groupBrandsByCategorization,
  GuaranteeForm,
} from '../../shared'

import { createAddGuaranteeDefaults } from './add-guarantee.defaults'
import { handleAddGuaranteeSubmit } from './add-guarantee.submit'

type AddGuaranteeProps = {
  categoriesData: TGetCategoriesResponse
  productsData: TGetProductsResponse
  brandsData: TGetBrandsResponse
  lockedPricesMap: TLockedPricesMap
}

export function AddGuarantee({
  categoriesData,
  productsData,
  brandsData,
  lockedPricesMap,
}: AddGuaranteeProps) {
  const isBrandsData = brandsData.success
  const isCategoriesData = categoriesData.success
  const isProductsData = productsData.success

  const readyCategoriesData = isCategoriesData ? categoriesData.categories : []
  const readyProductsData = isProductsData ? productsData.products : []
  const groupedBrands = isBrandsData
    ? groupBrandsByCategorization(brandsData.brands)
    : []

  return (
    <GuaranteeForm
      formId="add-guarantee-form"
      legend="Add New Guarantee"
      description="Fill the following fields"
      defaultValues={createAddGuaranteeDefaults()}
      onSubmit={async ({ value, form }) => {
        const result = await handleAddGuaranteeSubmit({
          values: value as GuaranteeSchemaT,
          form,
        })
        if (result?.success) form.reset()
      }}
      fieldsProps={{
        isCreate: true,
        isBrandsData,
        brandsPlaceholder: isBrandsData ? brandsData.brands[0].name : undefined,
        groupedBrands,
        readyCategoriesData,
        readyProductsData,
        lockedPricesMap,
        initialValues: {},
        storageKey: undefined,
        currentName: undefined,
      }}
    />
  )
}
