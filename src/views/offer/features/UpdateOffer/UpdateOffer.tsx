'use client'

import { useRouter } from 'next/navigation'

import { type TGetCategoriesResponse } from '@/views/category'

import { type TGetProductsResponse } from '@/views/product'

import {
  type TGetOfferLookupResponse,
  type TLockedPricesMap,
  type TOfferLookupDataWithId,
  offerErrors,
  OfferForm,
} from '../../shared'

import { FieldTitle } from '@/components/ui/field'
import { createUpdateOfferDefaults } from './update-offer.defaults'
import { handleUpdateOfferSubmit } from './update-offer.submit'

type UpdateOfferProps = {
  offerKey: string
  offerData: TGetOfferLookupResponse
  categoriesData: TGetCategoriesResponse
  productsData: TGetProductsResponse
  lockedPricesMap: TLockedPricesMap
}

export function UpdateOffer({
  offerKey,
  offerData,
  categoriesData,
  productsData,
  lockedPricesMap,
}: UpdateOfferProps) {
  const router = useRouter()

  const isOfferData = offerData.success
  const isCategoriesData = categoriesData.success
  const isProductsData = productsData.success

  const initialValues: Partial<TOfferLookupDataWithId> = isOfferData
    ? offerData.offer
    : {}

  // Freeze to prevent accidental mutation during render
  if (isOfferData) Object.freeze(initialValues)

  const readyCategoriesData = isCategoriesData ? categoriesData.categories : []
  const readyProductsData = isProductsData ? productsData.products : []

  return (
    <OfferForm
      key={offerKey}
      formId="update-offer-form"
      legend={`Update ${isOfferData ? offerData.offer.name : 'Offer'}`}
      description="Fill the desired fields"
      defaultValues={createUpdateOfferDefaults(initialValues)}
      errorBanner={
        !isOfferData ? (
          <FieldTitle className="text-destructive">
            Failure to get the offer details:{' '}
            {offerData.errors.code
              ? offerErrors[offerData.errors.code].client
              : 'Please try again!'}
          </FieldTitle>
        ) : undefined
      }
      submitLabel="Update"
      onSubmit={async ({ value, form }) => {
        if (!isOfferData) return

        const result = await handleUpdateOfferSubmit({
          values: value,
          offer: offerData.offer,
          form,
        })

        if ('success' in result && result.success && result.shouldNavigate) {
          router.replace(`/dashboard/products/offers/${result.slug}`)
        }
      }}
      fieldsProps={{
        isCreate: false,
        readyCategoriesData,
        readyProductsData,
        lockedPricesMap,
        initialValues,
        storageKey: `offer-target-selection-${initialValues.id}`,
        currentName: isOfferData ? offerData.offer.name : undefined,
      }}
    />
  )
}
