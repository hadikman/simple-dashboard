import React from 'react'

import { queryBrandsProps, UpdateBrandPage } from '@/views/brand'

const PLACEHOLDER = '__placeholder__'

async function getBrandsProps() {
  return await queryBrandsProps({ keys: { name: true, slug: true } })
}

export async function generateStaticParams() {
  const brandsProps = await getBrandsProps()

  if (brandsProps.success) {
    const { brands } = brandsProps
    if (brands.length > 0) {
      return brands.map(({ slug }) => ({ slug }))
    }
  }

  return [{ src: PLACEHOLDER }]
}

export async function generateMetadata({
  params,
}: PageProps<'/dashboard/products/brands/[slug]'>) {
  const { slug } = await params
  const brandsProps = await getBrandsProps()

  if (brandsProps.success) {
    const brand = brandsProps.brands.find(b => b.slug === slug)

    return {
      title: 'Brand: ' + brand?.name,
    }
  }

  return {
    title: 'Unknown Brand',
  }
}

export default function Brand({
  params,
}: PageProps<'/dashboard/products/brands/[slug]'>) {
  const { slug } = React.use(params)

  return <UpdateBrandPage slug={slug} />
}
