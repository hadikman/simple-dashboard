import { type FlatCategoryNode } from '@/views/category'

import { type TFeatureLookupResponse } from '@/views/features'

import { type PriceItem, NO_ID } from '../'

export function getEffectivePrices(leafs: PriceItem[]) {
  const effective = { min: leafs[0].price || 0, max: leafs[0].price || 0 }
  for (let i = 1; i < leafs.length; i++) {
    effective.min = Math.min(leafs[i].price, effective.min)
    effective.max = Math.max(leafs[i].price, effective.max)
  }
  return effective
}

export function getCategoriesWithParentMap(
  flattenedCategoriesData: FlatCategoryNode[],
) {
  const map = new Map<string, string[]>()
  for (let i = 0; i < flattenedCategoriesData.length; i++) {
    const { id, ancestorIds } = flattenedCategoriesData[i]
    map.set(id, ancestorIds.concat(id))
  }
  return map
}

export function getProductFeatureUtils(featuresData: TFeatureLookupResponse[]) {
  const idxMap = new Map<string, number>()

  const grouped = featuresData.reduce<
    Record<string, { category: string; features: TFeatureLookupResponse[] }>
  >((acc, feature, i) => {
    const applicableCategoryId = feature.applicable_category_id

    // If empty category → use "General"
    if (!applicableCategoryId) {
      if (!acc[NO_ID]) acc[NO_ID] = { category: 'General', features: [] }
      acc[NO_ID].features.push(feature)
    } else {
      if (!acc[applicableCategoryId]) {
        acc[applicableCategoryId] = {
          category: feature.applicable_category_name,
          features: [],
        }
      }
      acc[applicableCategoryId].features.push(feature)
    }

    // Irrelevent, only for filling features indexes map
    idxMap.set(feature.id, i)

    return acc
  }, {})

  const sorted = Object.entries(grouped).sort((a, b) => {
    if (a[1].category === 'General') return 1
    if (b[1].category === 'General') return -1
    return 0
  })

  return { featuresIdxsMap: idxMap, groupedFeaturesSorted: sorted }
}
