import React from 'react'

import { queryCategories } from '@/views/category'

import { queryProducts } from '@/views/product'

import { getLockedPricesMap, offerErrors, queryOffers } from '../'

import { EmptyView } from '@/components/empty-view'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { AddOffer } from '../../features/AddOffer/AddOffer'
import { OffersTable } from '../../features/ViewOffer/OffersTable'

export function AddViewOffersPage() {
  const offersData = React.use(queryOffers())
  const productsData = React.use(queryProducts({ type: 'published' }))
  const categoriesData = React.use(
    queryCategories({ category_group: 'products' }),
  )

  const isOffersData = offersData.success

  const offers = isOffersData ? offersData.offers : []
  const lockedPricesMap = getLockedPricesMap(offers)

  return (
    <React.Suspense fallback={<Spinner />}>
      <AddOffer
        categoriesData={categoriesData}
        productsData={productsData}
        lockedPricesMap={lockedPricesMap}
      />
      <Separator className="my-5" />

      {isOffersData ? (
        <div>
          <h1 className="mb-6 font-medium">Offers Table</h1>
          <OffersTable offersData={offers} />
        </div>
      ) : (
        <EmptyView
          title={
            !isOffersData && offersData?.errors?.code
              ? offerErrors[offersData.errors.code].client
              : 'Empty Offers, Create A New Offer.'
          }
          featureName="offer"
          formName="add offer"
        />
      )}
    </React.Suspense>
  )
}
