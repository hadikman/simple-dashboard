import React from 'react'

import { type TProductLookupResponseWithSubRowsData } from './view-products.types'

import {
  type TProductLookupResponse,
  productErrors,
  queryProducts,
} from '../../shared'

import { EmptyView } from '@/components/empty-view'
import { AllProductsTable } from './components/AllProductsTable'

export function ViewProductsPage() {
  const productsData = React.use(queryProducts({ type: 'published' }))
  const productsDraftData = React.use(queryProducts({ type: 'draft' }))

  const isProductsData = productsData.success
  const isProductsDraftData = productsDraftData.success
  const isAllProductsTypesData = isProductsData || isProductsDraftData

  if (!isAllProductsTypesData) {
    return (
      <EmptyView
        title={
          !isProductsData && productsData?.errors?.code
            ? productErrors[productsData.errors.code].client
            : 'Empty Products, Create A New Product.'
        }
        featureName="product"
        formName="new product"
      />
    )
  }

  const PD = isProductsData ? productsData.products : []
  const PDD = isProductsDraftData ? productsDraftData.products : []

  const draftGroupIdsMap = new Map<string, TProductLookupResponse>()
  PDD.forEach(p => draftGroupIdsMap.set(p.product_group_id, p))

  const productsWithDraftData: TProductLookupResponseWithSubRowsData = PD.map(
    p => {
      const isDraftedOfPublishedVersion = p.is_published
      const pdd = draftGroupIdsMap.get(p.product_group_id)

      // Return Audit version
      if (!isDraftedOfPublishedVersion && pdd) {
        return pdd
      }

      // For Expanded Row (has the same changes into columns.tsx at title and status):
      // If subRows has published version the "subRows: [p]"
      // If subRows has draft version the "subRows: [pdd]"
      if (pdd) {
        return { ...p, subRows: [pdd] }
      }

      return p
    },
  )

  return <AllProductsTable productsData={productsWithDraftData} />
}
