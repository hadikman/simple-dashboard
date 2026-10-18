import { type TLockedPricesMap, type TOfferLookupResponse } from './'

export function getLockedPricesMap(
  offers: TOfferLookupResponse[],
  slug?: string,
) {
  const lockedPricesMap: TLockedPricesMap = {}

  for (let i = 0; i < offers.length; i++) {
    const { id, name, slug: s, target_items } = offers[i]
    if (s === slug) continue

    for (let j = 0; j < target_items.length; j++) {
      const item = target_items[j]
      // First one wins — a price should only exist in one offer anyway
      if (!lockedPricesMap[item.price_id]) {
        lockedPricesMap[item.price_id] = {
          offer_id: id,
          offer_name: name,
        }
      }
    }
  }

  return lockedPricesMap
}
