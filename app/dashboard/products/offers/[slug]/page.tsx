import React from 'react'

import { queryOffersProps, UpdateOfferPage } from '@/views/offer'

import { Spinner } from '@/components/ui/spinner'

async function getOffersProps() {
  return await queryOffersProps({ name: true, slug: true })
}

export async function generateStaticParams() {
  const offersProps = await getOffersProps()

  if (offersProps.success) {
    const { offers } = offersProps
    if (offers.length > 0) {
      return offers.map(item => ({ slug: item.slug }))
    }
  }

  return null
}

export async function generateMetadata({
  params,
}: PageProps<'/dashboard/products/offers/[slug]'>) {
  const { slug } = await params
  const offersProps = await getOffersProps()

  if (offersProps.success) {
    const offer = offersProps.offers.find(f => f.slug === slug)

    return {
      title: 'Offer: ' + offer?.name,
    }
  }

  return {
    title: 'Unknown Offer',
  }
}

export default function Offer({
  params,
}: PageProps<'/dashboard/products/offers/[slug]'>) {
  const { slug } = React.use(params)

  return (
    <React.Suspense fallback={<Spinner />}>
      <UpdateOfferPage slug={slug} />
    </React.Suspense>
  )
}
