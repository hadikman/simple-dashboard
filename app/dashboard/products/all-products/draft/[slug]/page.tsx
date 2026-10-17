import React from 'react'

import {
  getUserQueryOptions,
  UserIdHydrationBoundary,
} from '@/views/authentication'

import { queryProductsProps, UpdateProductPage } from '@/views/product'

import { isString } from '@/helpers/utils'

const PLACEHOLDER = '__placeholder__'

async function getProductsProps() {
  return await queryProductsProps({
    keys: { product_group_id: true, title: true, slug: true },
    type: 'draft',
  })
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
  searchParams,
}: PageProps<'/dashboard/products/all-products/draft/[slug]'>) {
  const queries = await searchParams
  const queryGroupId = queries['group-id']
  const productsProps = await getProductsProps()

  if (productsProps.success) {
    const product = productsProps.products.find(
      ({ product_group_id }) => product_group_id === queryGroupId,
    )

    return {
      title: product?.title,
    }
  }

  return {
    title: 'Unknown Product Draft',
  }
}

export default function Product({
  params,
  searchParams,
}: PageProps<'/dashboard/products/all-products/draft/[slug]'>) {
  const { slug } = React.use(params)
  const queries = React.use(searchParams)
  const queryGroupId = queries['group-id']
  const qroupIdString = isString(queryGroupId) ? queryGroupId : ''

  return (
    <UserIdHydrationBoundary queryOptions={getUserQueryOptions}>
      {userId => (
        <UpdateProductPage
          userId={userId}
          groupId={qroupIdString}
          productPageSlug={slug}
          productPageType="draft"
        />
      )}
    </UserIdHydrationBoundary>
  )
}
