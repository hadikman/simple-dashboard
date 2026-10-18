import { type TBrandLookupResponse } from '@/views/brand'

import { type TGuaranteeLookupResponse, type TLockedPricesMap } from './'

export function getLockedPricesMap(
  guarantees: TGuaranteeLookupResponse[],
  slug?: string,
) {
  const lockedPricesMap: TLockedPricesMap = {}

  for (let i = 0; i < guarantees.length; i++) {
    const { id, name, slug: s, target_items } = guarantees[i]
    if (s === slug) continue

    for (let j = 0; j < target_items.length; j++) {
      const item = target_items[j]
      // First one wins — a price should only exist in one guarantee anyway
      if (!lockedPricesMap[item.price_id]) {
        lockedPricesMap[item.price_id] = {
          guarantee_id: id,
          guarantee_name: name,
        }
      }
    }
  }

  return lockedPricesMap
}

export function groupBrandsByCategorization(brands: TBrandLookupResponse[]) {
  return Object.entries(
    Object.groupBy(brands, ({ categories }) =>
      categories.length === 0 ? 'General' : 'Categorized',
    ),
  )
}
