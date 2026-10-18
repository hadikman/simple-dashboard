'use client'

import { type TGetCategoriesResponse } from '@/views/category'

import { type TGetProductsResponse } from '@/views/product'

import {
  type OfferSchemaT,
  type TLockedPricesMap,
  OfferForm,
} from '../../shared'

import { createAddOfferDefaults } from './add-offer.defaults'
import { handleAddOfferSubmit } from './add-offer.submit'

type AddOfferPageProps = {
  categoriesData: TGetCategoriesResponse
  productsData: TGetProductsResponse
  lockedPricesMap: TLockedPricesMap
}

export function AddOffer({
  categoriesData,
  productsData,
  lockedPricesMap,
}: AddOfferPageProps) {
  const isCategoriesData = categoriesData.success
  const isProductsData = productsData.success

  const readyCategoriesData = isCategoriesData ? categoriesData.categories : []
  const readyProductsData = isProductsData ? productsData.products : []

  return (
    <OfferForm
      formId="add-offer-form"
      legend="Add New Offer"
      description="Fill the following fields"
      defaultValues={createAddOfferDefaults()}
      onSubmit={async ({ value, form }) => {
        const result = await handleAddOfferSubmit({
          values: value as OfferSchemaT,
          form,
        })
        if (result?.success) form.reset()
      }}
      fieldsProps={{
        isCreate: true,
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
