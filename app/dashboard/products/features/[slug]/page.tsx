import React from 'react'

import { queryFeaturesProps, UpdateFeaturePage } from '@/views/features'

import { Spinner } from '@/components/ui/spinner'

async function getFeaturesProps() {
  return await queryFeaturesProps({ name: true, slug: true })
}

export async function generateStaticParams() {
  const featuresProps = await getFeaturesProps()

  if (featuresProps.success) {
    const { features } = featuresProps
    if (features.length > 0) {
      return features.map(item => ({ slug: item.slug }))
    }
  }

  return null
}

export async function generateMetadata({
  params,
}: PageProps<'/dashboard/products/features/[slug]'>) {
  const { slug } = await params
  const featuresProps = await getFeaturesProps()

  if (featuresProps.success) {
    const feature = featuresProps.features.find(f => f.slug === slug)

    return {
      title: 'Feature: ' + feature?.name,
    }
  }

  return {
    title: 'Unknown Feature',
  }
}

export default function Feature({
  params,
}: PageProps<'/dashboard/products/features/[slug]'>) {
  const { slug } = React.use(params)

  return (
    <React.Suspense fallback={<Spinner />}>
      <UpdateFeaturePage slug={slug} />
    </React.Suspense>
  )
}
