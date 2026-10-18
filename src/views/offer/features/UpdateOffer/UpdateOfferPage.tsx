import React from 'react'

import { queryCategories } from '@/views/category'

import { queryProducts } from '@/views/product'

import { getLockedPricesMap, queryOffers } from '../../shared'

import { Spinner } from '@/components/ui/spinner'
import { UpdateOffer } from './UpdateOffer'
import { queryOffer } from './query-offer'

type UpdateOfferPageProps = {
  slug: string
}

export function UpdateOfferPage({ slug }: UpdateOfferPageProps) {
  const offersData = React.use(queryOffers())
  const offerData = React.use(queryOffer({ slug }))
  const categoriesData = React.use(
    queryCategories({ category_group: 'products' }),
  )
  const productsData = React.use(queryProducts({ type: 'published' }))

  const isOffersData = offersData.success

  const offers = isOffersData ? offersData.offers : []
  const lockedPricesMap = getLockedPricesMap(offers, slug)

  const offerKey = offerData.success
    ? `offer-${offerData.offer.id}-${offerData.offer.updated_at}`
    : `offer-${slug}`

  return (
    <React.Suspense fallback={<Spinner />}>
      <UpdateOffer
        offerKey={offerKey}
        offerData={offerData}
        categoriesData={categoriesData}
        productsData={productsData}
        lockedPricesMap={lockedPricesMap}
      />
    </React.Suspense>
  )
}
