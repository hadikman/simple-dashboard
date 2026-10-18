'use client'

import { useRouter } from 'next/navigation'

import { type TGetProductsResponse } from '@/views/product'

import { type TGetCategoriesResponse } from '@/views/category'

import { type TGetBrandsResponse } from '@/views/brand'

import {
  type TGetGuaranteeLookupResponse,
  type TGuaranteeLookupDataWithId,
  type TLockedPricesMap,
  groupBrandsByCategorization,
  guaranteeErrors,
  GuaranteeForm,
} from '../../shared'

import { FieldTitle } from '@/components/ui/field'
import { createUpdateGuaranteeDefaults } from './update-guarantee.defaults'
import { handleUpdateGuaranteeSubmit } from './update-guarantee.submit'

type UpdateGuaranteeProps = {
  guaranteeKey: string
  guaranteeData: TGetGuaranteeLookupResponse
  categoriesData: TGetCategoriesResponse
  productsData: TGetProductsResponse
  brandsData: TGetBrandsResponse
  lockedPricesMap: TLockedPricesMap
}

export function UpdateGuarantee({
  guaranteeKey,
  guaranteeData,
  categoriesData,
  productsData,
  brandsData,
  lockedPricesMap,
}: UpdateGuaranteeProps) {
  const router = useRouter()

  const isGuaranteeData = guaranteeData.success
  const isBrandsData = brandsData.success
  const isCategoriesData = categoriesData.success
  const isProductsData = productsData.success

  const initialValues: Partial<TGuaranteeLookupDataWithId> = isGuaranteeData
    ? guaranteeData.guarantee
    : {}

  // Freeze to prevent accidental mutation during render
  if (isGuaranteeData) Object.freeze(initialValues)

  const readyCategoriesData = isCategoriesData ? categoriesData.categories : []
  const readyProductsData = isProductsData ? productsData.products : []
  const groupedBrands = isBrandsData
    ? groupBrandsByCategorization(brandsData.brands)
    : []

  return (
    <GuaranteeForm
      key={guaranteeKey}
      formId="update-guarantee-form"
      legend={`Update ${isGuaranteeData ? guaranteeData.guarantee.name : 'Guarantee'}`}
      description="Fill the desired fields"
      defaultValues={createUpdateGuaranteeDefaults(initialValues)}
      errorBanner={
        !isGuaranteeData ? (
          <FieldTitle className="text-destructive">
            Failure to get the guarantee details:{' '}
            {guaranteeData.errors.code
              ? guaranteeErrors[guaranteeData.errors.code].client
              : 'Please try again!'}
          </FieldTitle>
        ) : undefined
      }
      submitLabel="Update"
      onSubmit={async ({ value, form }) => {
        if (!isGuaranteeData) return

        const result = await handleUpdateGuaranteeSubmit({
          values: value,
          guarantee: guaranteeData.guarantee,
          form,
        })

        if ('success' in result && result.success && result.shouldNavigate) {
          router.replace(`/dashboard/products/guarantees/${result.slug}`)
        }
      }}
      fieldsProps={{
        isCreate: false,
        isBrandsData,
        brandsPlaceholder: isBrandsData ? brandsData.brands[0].name : undefined,
        groupedBrands,
        readyCategoriesData,
        readyProductsData,
        lockedPricesMap,
        initialValues,
        storageKey: `guarantee-target-selection-${initialValues.id}`,
        currentName: isGuaranteeData ? guaranteeData.guarantee.name : undefined,
      }}
    />
  )
}
