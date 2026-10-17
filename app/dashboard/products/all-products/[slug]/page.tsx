import React from 'react'

import {
  getUserQueryOptions,
  UserIdHydrationBoundary,
} from '@/views/authentication'

import { queryProductsProps, UpdateProductPage } from '@/views/product'

const PLACEHOLDER = '__placeholder__'

async function getProductsProps() {
  return await queryProductsProps({ keys: { title: true, slug: true } })
}

export async function generateStaticParams() {
  const productsProps = await getProductsProps()

  if (productsProps.success) {
    const { products } = productsProps
    if (products.length > 0) {
      return products.map(({ slug }) => ({ slug }))
    }
  }

  return [{ src: PLACEHOLDER }]
}

export async function generateMetadata({
  params,
}: PageProps<'/dashboard/products/all-products/[slug]'>) {
  const { slug } = await params
  const productsProps = await getProductsProps()

  if (productsProps.success) {
    const product = productsProps.products.find(p => p.slug === slug)

    return {
      title: product?.title,
    }
  }

  return {
    title: 'Unknown Product',
  }
}

export default function Product({
  params,
}: PageProps<'/dashboard/products/all-products/[slug]'>) {
  const { slug } = React.use(params)

  return (
    <UserIdHydrationBoundary queryOptions={getUserQueryOptions}>
      {userId => (
        <UpdateProductPage
          userId={userId}
          productPageSlug={slug}
          productPageType="published"
        />
      )}
    </UserIdHydrationBoundary>
  )
}
